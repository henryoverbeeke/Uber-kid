import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';

const EMPLOYEE_CODE = '492412'; // Updated employee code
const ADMIN_CODE = 'ss5932'; // Updated admin code

function LoginPage({ setIsEmployee, setIsAdmin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmployeeLogin = () => {
    if (code === EMPLOYEE_CODE) {
      setIsEmployee(true);
      navigate('/employee');
    } else {
      setError('Invalid employee code');
    }
  };

  const handleAdminLogin = () => {
    if (code === ADMIN_CODE) {
      setIsAdmin(true);
      navigate('/admin');
    } else {
      setError('Invalid admin code');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.pathname === '/admin') {
      handleAdminLogin();
    } else {
      handleEmployeeLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Staff Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEmployeeLogin}
              size="large"
            >
              Employee Login
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAdminLogin}
              size="large"
            >
              Admin Login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage; 