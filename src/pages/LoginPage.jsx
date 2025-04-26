import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { getAdminSettings } from '../config/airtable';
import { useAuth } from '../contexts/AuthContext';
import CenteredLayout from '../components/CenteredLayout';

function LoginPage({ role }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const settings = await getAdminSettings();
      if (!settings) {
        setError('Unable to verify password. Please try again.');
        return;
      }

      const correctPassword = role === 'admin' 
        ? settings.adminPassword 
        : settings.employeePassword;

      if (password === correctPassword) {
        login(role);
        navigate(role === 'admin' ? '/admin' : '/employee');
      } else {
        setError('Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredLayout>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 'sm' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {role === 'admin' ? 'Admin Login' : 'Employee Login'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </CenteredLayout>
  );
}

export default LoginPage; 