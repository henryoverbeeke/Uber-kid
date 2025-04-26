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
} from '@mui/material';
import { Notifications, Delete } from '@mui/icons-material';
import { orderingTable, messageTable } from '../config/airtable';
import CenteredLayout from '../components/CenteredLayout';

function EmployeePage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (error) {
      console.error('Error creating ring notification:', error);
    }
  };

  return (
    <CenteredLayout>
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
    </CenteredLayout>
  );
}

export default EmployeePage; 