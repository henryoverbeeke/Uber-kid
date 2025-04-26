import { Box, Container } from '@mui/material';

function CenteredLayout({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default CenteredLayout; 