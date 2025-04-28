import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ButtonBase,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Notifications, Delete, CheckCircle, Check, Clear, Message, CloudOff } from '@mui/icons-material';
import { orderingTable, messageTable, beepTable, isSystemOnline } from '../config/airtable';
import CenteredLayout from '../components/CenteredLayout';

// Create Audio object for beep sound
const beepSound = new Audio('https://www.soundjay.com/button/beep-07.wav');

function EmployeePage() {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [manualMessage, setManualMessage] = useState('');
  const [beeps, setBeeps] = useState([]);
  const [isOffline, setIsOffline] = useState(!isSystemOnline());

  useEffect(() => {
    const initializeData = async () => {
      if (!isSystemOnline()) {
        setIsOffline(true);
        return;
      }
      setIsOffline(false);
      await Promise.all([fetchOrders(), fetchMessages(), fetchBeeps()]);
    };

    initializeData();
    const interval = setInterval(initializeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const records = await orderingTable.select({
        filterByFormula: 'NOT({delivered} = 1)',
        sort: [{ field: 'foodName', direction: 'desc' }]
      }).firstPage();
      
      // Check for status changes and play beep
      if (orders.length > 0) {
        records.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.foodStatus !== newOrder.fields.foodStatus) {
            beepSound.play().catch(err => console.error('Error playing sound:', err));
          }
        });
      }
      setOrders(records.map(record => ({
        id: record.id,
        foodName: record.fields.foodName,
        foodStatus: record.fields.foodStatus || 'ordered',
        servings: record.fields.servings
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const records = await messageTable.select({
        sort: [{ field: 'createdTime', direction: 'desc' }]
      }).firstPage();
      
      setMessages(records.map(record => ({
        id: record.id,
        title: record.fields.Title,
        message: record.fields.message,
        acknowledged: record.fields.acknowledged || false
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchBeeps = async () => {
    try {
      const records = await beepTable.select({
        filterByFormula: '{isCalling} = 1',
        sort: [{ field: 'createdTime', direction: 'desc' }]
      }).firstPage();

      const newBeeps = records.map(record => ({
        id: record.id,
        whoCall: record.fields.whoCall,
        timestamp: record.fields.createdTime
      }));

      // Check for new beeps and play sound
      if (newBeeps.length > beeps.length) {
        beepSound.play().catch(err => console.error('Error playing sound:', err));
      }

      setBeeps(newBeeps);
    } catch (error) {
      console.error('Error fetching beeps:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderingTable.update(orderId, {
        foodStatus: newStatus
      });
      beepSound.play().catch(err => console.error('Error playing sound:', err));
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      // Delete the record from Airtable
      await orderingTable.destroy(orderId);
      
      // Play beep sound for confirmation
      beepSound.play().catch(err => console.error('Error playing sound:', err));
      
      // Update local state to remove the deleted order
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleRing = async (orderId) => {
    try {
      await messageTable.create([
        {
          fields: {
            Title: 'Order Ready',
            message: 'Your order is ready for pickup!',
            ringing: true
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating ring notification:', error);
    }
  };

  const handleAcknowledgeMessage = async (messageId) => {
    try {
      await messageTable.update(messageId, {
        acknowledged: true
      });
      await fetchMessages();
    } catch (error) {
      console.error('Error acknowledging message:', error);
    }
  };

  const handleAcknowledgeBeep = async (beepId) => {
    try {
      await beepTable.update(beepId, {
        isCalling: false
      });
      await fetchBeeps(); // Refresh beeps immediately
    } catch (error) {
      console.error('Error acknowledging beep:', error);
    }
  };

  const handleMessageClick = (order) => {
    setSelectedOrder(order);
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedOrder || !manualMessage.trim()) return;

    try {
      await orderingTable.update(selectedOrder.id, { 
        employeeMessage: manualMessage,
        messageTimestamp: new Date().toISOString()
      });
      
      // Play beep sound for confirmation
      beepSound.play().catch(err => console.error('Error playing sound:', err));
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, foodStatus: 'completed', employeeMessage: manualMessage, messageTimestamp: new Date().toISOString() } 
          : order
      ));
      
      // Reset and close dialog
      setManualMessage('');
      setMessageDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <CenteredLayout>
      {isOffline && (
        <Alert 
          severity="warning" 
          icon={<CloudOff />}
          sx={{ 
            width: '100%', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          System is currently offline. Updates are paused.
        </Alert>
      )}

      {/* Beep Alerts Section */}
      {beeps.map((beep) => (
        <Alert
          key={beep.id}
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => handleAcknowledgeBeep(beep.id)}
            >
              Acknowledge
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Customer Needs Assistance!
          </Typography>
          <Typography variant="body2">
            {beep.whoCall} is calling for help
          </Typography>
        </Alert>
      ))}

      {/* Pinned Messages Section */}
      {messages.filter(msg => !msg.acknowledged).map((msg) => (
        <Alert
          key={msg.id}
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<CheckCircle />}
              onClick={() => handleAcknowledgeMessage(msg.id)}
            >
              Got it
            </Button>
          }
          sx={{
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {msg.title}
          </Typography>
          <Typography variant="body2">
            {msg.message}
          </Typography>
        </Alert>
      ))}

      {/* Orders Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          '& .MuiIconButton-root': {
            p: { xs: 2, sm: 1.5 },
            transition: 'transform 0.2s, background-color 0.2s',
            '&:active': {
              transform: 'scale(0.95)'
            }
          },
          '& .MuiSelect-select': {
            py: { xs: 1.5, sm: 1 },
            px: { xs: 2, sm: 1.5 }
          },
          '& .MuiMenuItem-root': {
            py: { xs: 1.5, sm: 1 },
            minHeight: { xs: 48, sm: 'auto' }
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          Manage Orders
        </Typography>
        <List 
          sx={{ 
            width: '100%',
            '& .MuiListItem-root': {
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:active': {
                bgcolor: 'action.selected'
              }
            }
          }}
        >
          {orders.map((order) => (
            <ListItem
              key={order.id}
              divider
              component={ButtonBase}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 2, sm: 3 },
                py: { xs: 3, sm: 2.5 },
                px: { xs: 2, sm: 3 },
                width: '100%',
                textAlign: 'left',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                      fontWeight: 500
                    }}
                  >
                    {order.foodName}
                  </Typography>
                }
                secondary={
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1rem', md: '1.1rem' },
                      mt: 0.5
                    }}
                  >
                    Servings: {order.servings}
                  </Typography>
                }
              />
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 2, sm: 2 }, 
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'space-between', sm: 'flex-end' }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FormControl 
                  size="small"
                  sx={{ 
                    minWidth: { xs: 180, sm: 150 },
                    flex: { xs: 1, sm: 'none' }
                  }}
                >
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={order.foodStatus}
                    label="Status"
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: { xs: '1rem', sm: '0.9rem' }
                      }
                    }}
                  >
                    <MenuItem value="ordered">Ordered</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="delivering">Delivering</MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  onClick={() => handleRing(order.id)}
                  color="secondary"
                  sx={{ 
                    width: { xs: 48, sm: 40 },
                    height: { xs: 48, sm: 40 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.5rem', sm: '1.25rem' }
                    }
                  }}
                >
                  <Notifications />
                </IconButton>

                <IconButton
                  onClick={() => handleDeleteOrder(order.id)}
                  color="error"
                  sx={{ 
                    width: { xs: 48, sm: 40 },
                    height: { xs: 48, sm: 40 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.5rem', sm: '1.25rem' }
                    }
                  }}
                >
                  <Delete />
                </IconButton>

                <IconButton
                  onClick={() => handleMessageClick(order)}
                  color="primary"
                  sx={{ 
                    width: { xs: 48, sm: 40 },
                    height: { xs: 48, sm: 40 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.5rem', sm: '1.25rem' }
                    }
                  }}
                >
                  <Message />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)}>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            value={manualMessage}
            onChange={(e) => setManualMessage(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </CenteredLayout>
  );
}

export default EmployeePage; 