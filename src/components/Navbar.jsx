import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navbar({ isEmployee, isAdmin, setIsEmployee, setIsAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsEmployee(false);
    setIsAdmin(false);
    navigate('/');
  };

  const handleAdminClick = () => {
    if (!isAdmin && isEmployee) {
      const adminCode = prompt('Enter admin code:');
      if (adminCode === 'ss5932') {
        setIsAdmin(true);
        navigate('/admin');
      } else {
        alert('Invalid admin code');
      }
    } else {
      navigate('/admin');
    }
  };

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Customer
          </Button>
          {(isEmployee || isAdmin) && (
            <Button color="inherit" onClick={() => navigate('/employee')}>
              Employee
            </Button>
          )}
          {(isEmployee || isAdmin) && (
            <Button color="inherit" onClick={handleAdminClick}>
              Admin
            </Button>
          )}
        </Box>
        {(isEmployee || isAdmin) ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Staff Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 