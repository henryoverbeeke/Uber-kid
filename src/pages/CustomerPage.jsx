import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { orderingTable, messageTable } from '../config/airtable';
import useSound from 'use-sound';

function CustomerPage() {
  const [foodName, setFoodName] = useState('');
  const [servings, setServings] = useState('');
  const [orders, setOrders] = useState([]);
  const [isRinging, setIsRinging] = useState(false);
  const [play, { stop }] = useSound('/sound/bell.mp3', { loop: true });

  useEffect(() => {
    fetchOrders();
    checkRinging();
    const interval = setInterval(() => {
      fetchOrders();
      checkRinging();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRinging) {
      play();
    } else {
      stop();
    }
  }, [isRinging, play, stop]);

  const checkRinging = async () => {
    try {
      const records = await messageTable.select({
        filterByFormula: '{ringing} = 1'
      }).firstPage();
      setIsRinging(records.length > 0);
    } catch (error) {
      console.error('Error checking ring status:', error);
    }
  };

  const handleImComing = async () => {
    try {
      const records = await messageTable.select({
        filterByFormula: '{ringing} = 1'
      }).firstPage();
      
      for (let record of records) {
        await messageTable.update(record.id, {
          ringing: false
        });
      }
      setIsRinging(false);
    } catch (error) {
      console.error('Error updating ring status:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const records = await orderingTable.select({
        filterByFormula: 'NOT({delivered} = 1)',
        sort: [{ field: 'foodName', direction: 'desc' }]
      }).firstPage();
      
      setOrders(records.map(record => ({
        id: record.id,
        foodName: record.fields.foodName,
        foodStatus: record.fields.foodStatus,
        servings: record.fields.servings,
        foodImage: record.fields.foodImage
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderingTable.create([
        {
          fields: {
            foodName,
            foodStatus: 'ordered',
            servings
          }
        }
      ]);
      setFoodName('');
      setServings('');
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Dialog open={isRinging} onClose={handleImComing}>
        <DialogTitle>Your order is ready!</DialogTitle>
        <DialogContent>
          <Typography>Please come to collect your order.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImComing} color="primary" variant="contained">
            I'm Coming!
          </Button>
        </DialogActions>
      </Dialog>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Place Your Order
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Food Name"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Number of Servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Place Order
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Orders
        </Typography>
        <List>
          {orders.map((order) => (
            <ListItem key={order.id} divider>
              <ListItemText
                primary={order.foodName}
                secondary={`Status: ${order.foodStatus} | Servings: ${order.servings}`}
              />
              {order.foodImage && (
                <Box sx={{ ml: 2 }}>
                  <img
                    src={order.foodImage[0].url}
                    alt={order.foodName}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default CustomerPage; 