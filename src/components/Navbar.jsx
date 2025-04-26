import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Common styles for buttons
  const adminButtonStyle = {
    bgcolor: '#d32f2f',
    color: '#ffffff',
    '&:hover': {
      bgcolor: '#c62828',
      color: '#ff9800',
    },
  };

  const employeeButtonStyle = {
    bgcolor: '#1976d2',
    color: '#ffffff',
    '&:hover': {
      bgcolor: '#1565c0',
      color: '#ff9800',
    },
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color="info"
            component={RouterLink}
            to="/"
            sx={employeeButtonStyle}
          >
            Home
          </Button>
        </Box>

        {isAuthenticated.role ? (
          <>
            <Typography variant="subtitle1" sx={{ mr: 2, color: '#ffffff' }}>
              {isAuthenticated.role === 'admin' ? 'Admin' : 'Employee'}
            </Typography>
            <Button
              color={isAuthenticated.role === 'admin' ? 'error' : 'info'}
              component={RouterLink}
              to={isAuthenticated.role === 'admin' ? '/admin' : '/employee'}
              sx={{
                mr: 1,
                ...(isAuthenticated.role === 'admin' ? adminButtonStyle : employeeButtonStyle),
              }}
            >
              Dashboard
            </Button>
            {isAuthenticated.role === 'employee' && (
              <Button
                color="error"
                component={RouterLink}
                to="/admin-login"
                sx={{
                  mr: 1,
                  ...adminButtonStyle,
                }}
              >
                Admin Access
              </Button>
            )}
            <Button
              color={isAuthenticated.role === 'admin' ? 'error' : 'info'}
              onClick={handleLogout}
              sx={{
                ...(isAuthenticated.role === 'admin' ? adminButtonStyle : employeeButtonStyle),
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              color="info"
              component={RouterLink}
              to="/employee-login"
              sx={{
                mr: 1,
                ...employeeButtonStyle,
              }}
            >
              Employee
            </Button>
            <Button
              color="error"
              component={RouterLink}
              to="/admin-login"
              sx={{
                ...adminButtonStyle,
              }}
            >
              Admin
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 