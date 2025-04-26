import { Box, Container } from '@mui/material';
import Footer from './Footer';

function CenteredLayout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#000000',
        color: '#ffffff'
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          width: '100%',
          p: 2,
          pb: 10 // Add padding at bottom to prevent content from being hidden behind footer
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
      <Footer />
    </Box>
  );
}

export default CenteredLayout; 