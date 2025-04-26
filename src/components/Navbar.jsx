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

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Home
          </Button>
        </Box>

        {isAuthenticated.role ? (
          <>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              {isAuthenticated.role === 'admin' ? 'Admin' : 'Employee'}
            </Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to={isAuthenticated.role === 'admin' ? '/admin' : '/employee'}
              sx={{ mr: 1 }}
            >
              Dashboard
            </Button>
            {isAuthenticated.role === 'employee' && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin-login"
                sx={{ mr: 1 }}
              >
                Admin Access
              </Button>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/employee-login"
              sx={{ mr: 1 }}
            >
              Employee
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/admin-login"
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