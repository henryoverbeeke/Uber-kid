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
  Alert,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import { orderingTable, messageTable, getAdminSettings } from '../config/airtable';
import useSound from 'use-sound';
import CenteredLayout from '../components/CenteredLayout';

// Array of sus images for Impasta mode
const susImages = [
  'https://i.imgur.com/3DMM3Ng.png',  // Red sus
  'https://i.imgur.com/TZN6X5q.png',  // Blue sus
  'https://i.imgur.com/6jRrtmM.png',  // Green sus
  'https://i.imgur.com/QqHqAl5.png',  // Yellow sus
  'https://i.imgur.com/xYtH4Xq.png',  // Pink sus
  'https://i.imgur.com/K1J7WVM.png',  // Orange sus
  'https://i.imgur.com/WQY9nRr.png',  // Purple sus
  'https://i.imgur.com/Z8J8jQx.png',  // Brown sus
  'https://i.imgur.com/1TjqJ6p.png',  // White sus
  'https://i.imgur.com/YZuZkGJ.png',  // Black sus
];

function CustomerPage() {
  const [foodName, setFoodName] = useState('');
  const [servings, setServings] = useState('');
  const [orders, setOrders] = useState([]);
  const [isRinging, setIsRinging] = useState(false);
  const [play, { stop }] = useSound('/sound/bell.mp3', { loop: true });
  const [orderStatus, setOrderStatus] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    checkRinging();
    checkAdminSettings();
    const interval = setInterval(() => {
      fetchOrders();
      checkRinging();
      checkAdminSettings();
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

  const checkAdminSettings = async () => {
    const settings = await getAdminSettings();
    setAdminSettings(settings);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!adminSettings?.isUp) {
      setOrderStatus({ type: 'error', message: 'System is currently offline. Please try again later.' });
      return;
    }

    if (!adminSettings?.canOrder) {
      setOrderStatus({ type: 'error', message: 'Ordering is currently disabled. Please try again later.' });
      return;
    }

    try {
      await orderingTable.create([
        {
          fields: {
            foodName,
            servings: servings.toString(),
          },
        },
      ]);
      setFoodName('');
      setServings('');
      setOrderStatus({ type: 'success', message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderStatus({ type: 'error', message: 'Failed to place order. Please try again.' });
    }
  };

  if (loading) {
    return (
      <CenteredLayout>
        <Typography>Loading...</Typography>
      </CenteredLayout>
    );
  }

  if (!adminSettings?.isUp) {
    return (
      <CenteredLayout>
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          System is currently offline. Please try again later.
        </Alert>
      </CenteredLayout>
    );
  }

  if (adminSettings?.isImpastaMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            color: 'error.main',
            fontWeight: 'bold',
            mb: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          IMPASTA MODE ACTIVATED
        </Typography>
        <Grid container spacing={3}>
          {susImages.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transform: 'rotate(' + (Math.random() * 10 - 5) + 'deg)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(0deg)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  image={image}
                  alt="Sus"
                  sx={{
                    height: 200,
                    objectFit: 'contain',
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.05)'
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

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
          {!adminSettings?.canOrder && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Ordering is currently disabled. Please try again later.
            </Alert>
          )}

          {orderStatus && (
            <Alert severity={orderStatus.type} sx={{ mb: 2 }}>
              {orderStatus.message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Food Name"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            disabled={!adminSettings?.canOrder}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Number of Servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
            disabled={!adminSettings?.canOrder}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!adminSettings?.canOrder}
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