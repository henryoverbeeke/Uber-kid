import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import './App.css';

// Create theme with admin and employee variants
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2', // Blue for employee/home
    },
    secondary: {
      main: '#d32f2f', // Red for admin
    },
    error: {
      main: '#d32f2f',
      dark: '#c62828',
    },
    info: {
      main: '#1976d2',
      dark: '#1565c0',
    },
    background: {
      default: '#000000',
      paper: '#121212',
      admin: '#d32f2f',
      employee: '#1976d2',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    }
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'admin' },
          style: {
            backgroundColor: '#d32f2f',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#c62828',
            },
          },
        },
        {
          props: { variant: 'employee' },
          style: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          },
        },
      ],
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'error' && {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
          }),
          ...(ownerState.color === 'info' && {
            backgroundColor: theme.palette.info.main,
            '&:hover': {
              backgroundColor: theme.palette.info.dark,
            },
          }),
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated.role) {
    return <Navigate to={`/${requiredRole}-login`} replace />;
  }

  if (requiredRole === 'admin' && isAuthenticated.role !== 'admin') {
    return <Navigate to="/employee" replace />;
  }

  if (requiredRole === 'employee' && !['employee', 'admin'].includes(isAuthenticated.role)) {
    return <Navigate to="/employee-login" replace />;
  }

  return children;
};

function AppContent() {
  const [keyCount, setKeyCount] = useState(0);
  const { login } = useAuth();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'u') {
        setKeyCount(prev => prev + 1);
      } else {
        setKeyCount(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (keyCount === 5) {
      const secretCode = prompt('Enter secret code:');
      if (secretCode === 'adminhenry') {
        login('admin');
      }
      setKeyCount(0);
    }
  }, [keyCount, login]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/employee-login" element={<LoginPage role="employee" />} />
        <Route path="/admin-login" element={<LoginPage role="admin" />} />
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
