import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      p: 3
    }}>
      {/* Main Content */}
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AutoStoriesIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h1" component="h1" sx={{ 
            fontSize: { xs: '3rem', md: '5rem' }, 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 2,
            background: 'linear-gradient(45deg, #0b57d0 30%, #a8c7fa 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Volo's Codex
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
            Your intelligent AI companion for Tabletop RPGs. Search rules, generate encounters, and explore your worlds.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/chat')}
              sx={{ 
                fontSize: '1.2rem', 
                px: 4, 
                py: 1.5,
                borderRadius: 8,
                boxShadow: '0 4px 14px 0 rgba(11, 87, 208, 0.39)'
              }}
            >
              Start Chatting
            </Button>

            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/logs')}
              sx={{ 
                fontSize: '1.2rem', 
                px: 4, 
                py: 1.5,
                borderRadius: 8,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              View Logs
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', mt: 4 }}>
          {['D&D 5e', 'D&D 2024', 'Daggerheart', 'Iron Kingdoms'].map((system) => (
            <Paper key={system} elevation={0} sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 4,
              minWidth: '140px'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">{system}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ mt: 'auto', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          made by jorgevvs
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
