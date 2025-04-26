import { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
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
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  CircularProgress,
  Container,
  Alert,
} from '@mui/material';
import { Notifications, Delete, Security, Settings, Visibility, VisibilityOff } from '@mui/icons-material';
import { orderingTable, messageTable, adminTable, getAdminSettings, updateAdminSettings } from '../config/airtable';
import CenteredLayout from '../components/CenteredLayout';

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Admin settings states
  const [isUp, setIsUp] = useState(true);
  const [isImpastaMode, setIsImpastaMode] = useState(false);
  const [canOrder, setCanOrder] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [adminSettings, ordersData, messagesData] = await Promise.all([
        getAdminSettings(),
        fetchOrders(),
        fetchMessages(),
      ]);

      console.log('Fetched admin settings:', adminSettings);
      
      if (adminSettings) {
        setIsUp(adminSettings.isUp === true);
        setIsImpastaMode(adminSettings.isImpastaMode === true);
        setCanOrder(adminSettings.canOrder === true);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
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
        sort: [{ field: 'Title', direction: 'desc' }]
      }).firstPage();
      
      setMessages(records.map(record => ({
        id: record.id,
        title: record.fields.Title,
        message: record.fields.message,
        ringing: record.fields.ringing
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderingTable.update(orderId, {
        foodStatus: newStatus
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await orderingTable.update(orderId, {
        delivered: true
      });
      fetchOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
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
      fetchMessages();
    } catch (error) {
      console.error('Error creating ring notification:', error);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      await messageTable.create([
        {
          fields: {
            Title: title,
            message
          }
        }
      ]);
      setTitle('');
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageTable.destroy(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleAppStatusToggle = async () => {
    try {
      console.log('Toggling app status from:', isUp);
      const success = await updateAdminSettings({
        isUp: !isUp
      });
      console.log('Update success:', success);
      if (success) {
        setIsUp(!isUp);
      }
    } catch (err) {
      console.error('Error updating app status:', err);
      setError('Failed to update app status. Please try again.');
    }
  };

  const handleImpostaModeToggle = async () => {
    try {
      console.log('Toggling imposta mode from:', isImpastaMode);
      const success = await updateAdminSettings({
        isImpastaMode: !isImpastaMode
      });
      console.log('Update success:', success);
      if (success) {
        setIsImpastaMode(!isImpastaMode);
      }
    } catch (err) {
      console.error('Error updating imposta mode:', err);
      setError('Failed to update imposta mode. Please try again.');
    }
  };

  const handleOrderingToggle = async () => {
    try {
      console.log('Toggling ordering from:', canOrder);
      const success = await updateAdminSettings({
        canOrder: !canOrder
      });
      console.log('Update success:', success);
      if (success) {
        setCanOrder(!canOrder);
      }
    } catch (err) {
      console.error('Error updating ordering status:', err);
      setError('Failed to update ordering status. Please try again.');
    }
  };

  if (loading && !orders.length && !messages.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CenteredLayout>
      {/* Admin Controls Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Security /> Admin Controls
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* System Controls */}
          <Box>
            <Typography variant="h6" gutterBottom>System Controls</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isUp}
                    onChange={handleAppStatusToggle}
                  />
                }
                label={`System Status: ${isUp ? 'Online' : 'Offline'}`}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isImpastaMode}
                    onChange={handleImpostaModeToggle}
                  />
                }
                label={`Impasta Mode: ${isImpastaMode ? 'Active' : 'Inactive'}`}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={canOrder}
                    onChange={handleOrderingToggle}
                  />
                }
                label={`Customer Ordering: ${canOrder ? 'Enabled' : 'Disabled'}`}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

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
                  onClick={() => handleMarkDelivered(order.id)}
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
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          Send Message to Employees
        </Typography>
        <Box 
          component="form" 
          onSubmit={handleMessageSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 3 }
          }}
        >
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            size="medium"
            sx={{
              '& .MuiInputBase-input': {
                py: { xs: 1.5, sm: 1 },
                fontSize: { xs: '1rem', sm: '0.9rem' }
              }
            }}
          />
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            multiline
            rows={4}
            size="medium"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '1rem', sm: '0.9rem' }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: { xs: 1.5, sm: 1 },
              mt: { xs: 1, sm: 2 },
              fontSize: { xs: '1.1rem', sm: '1rem' },
              minHeight: { xs: 48, sm: 40 }
            }}
          >
            Send Message
          </Button>
        </Box>
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          Message History
        </Typography>
        <List sx={{ width: '100%' }}>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              divider
              component={ButtonBase}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: { xs: 2.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                width: '100%',
                textAlign: 'left',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                '&:active': {
                  bgcolor: 'action.selected'
                }
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMessage(msg.id);
                  }}
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
              }
            >
              <ListItemText
                primary={
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '1.1rem', sm: '1.1rem', md: '1.2rem' },
                      fontWeight: 500,
                      pr: { xs: 7, sm: 6 }
                    }}
                  >
                    {msg.title}
                  </Typography>
                }
                secondary={
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' },
                      mt: 0.5,
                      pr: { xs: 7, sm: 6 }
                    }}
                  >
                    {msg.message}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </CenteredLayout>
  );
}

export default AdminPage; 