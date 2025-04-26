import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        padding: '16px',
        backgroundColor: '#000000',
        position: 'fixed',
        bottom: 0,
        left: 0,
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0px -2px 4px rgba(0,0,0,0.2)',
        zIndex: 1300
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' },
          fontWeight: 500,
          color: '#ffffff'
        }}
      >
        Careo™ ©2025
      </Typography>
    </Box>
  );
}

export default Footer; 