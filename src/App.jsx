import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline, Container } from '@mui/material';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // Purple
    },
    secondary: {
      main: '#f44336', // Red
    },
  },
});

function App() {
  const [isEmployee, setIsEmployee] = useState(() => {
    const saved = localStorage.getItem('isEmployee');
    return saved === 'true';
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved === 'true';
  });
  
  const [keyCount, setKeyCount] = useState(0);

  const handleSetIsEmployee = (value) => {
    setIsEmployee(value);
    localStorage.setItem('isEmployee', value);
  };

  const handleSetIsAdmin = (value) => {
    setIsAdmin(value);
    localStorage.setItem('isAdmin', value);
    if (value) {
      handleSetIsEmployee(true); // Admin is also an employee
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'u') {
        setKeyCount((prev) => prev + 1);
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
        handleSetIsAdmin(true);
      }
      setKeyCount(0);
    }
  }, [keyCount]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar isEmployee={isEmployee} isAdmin={isAdmin} setIsEmployee={handleSetIsEmployee} setIsAdmin={handleSetIsAdmin} />
        <Container>
          <Routes>
            <Route path="/" element={<CustomerPage />} />
            <Route path="/login" element={<LoginPage setIsEmployee={handleSetIsEmployee} setIsAdmin={handleSetIsAdmin} />} />
            <Route
              path="/employee"
              element={isEmployee || isAdmin ? <EmployeePage /> : <LoginPage setIsEmployee={handleSetIsEmployee} setIsAdmin={handleSetIsAdmin} />}
            />
            <Route
              path="/admin"
              element={isAdmin ? <AdminPage /> : <LoginPage setIsEmployee={handleSetIsEmployee} setIsAdmin={handleSetIsAdmin} />}
            />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
