import React from 'react';
import { Box, Typography, Button, Container, Paper, useTheme, Grid } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      p: 3,
      background: theme.palette.mode === 'light' 
        ? 'radial-gradient(circle, #F5E6D3 0%, #E6C27A 100%)' 
        : 'radial-gradient(circle, #1A1A1D 0%, #000000 100%)',
    }}>
      {/* Main Content */}
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AutoStoriesIcon sx={{ fontSize: 100, color: 'primary.main', mb: 3, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.2))' }} />
          <Typography variant="h1" component="h1" sx={{ 
            fontSize: { xs: '3rem', md: '6rem' }, 
            color: 'text.primary',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            Volo's Codex
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: '700px', fontStyle: 'italic' }}>
            "Your intelligent companion for the realms of imagination. Search ancient tomes, chronicle your adventures, and master the rules."
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/chat')}
              sx={{ 
                fontSize: '1.2rem', 
                px: 6, 
                py: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.primary.dark}`,
              }}
            >
              Consult the Oracle
            </Button>

            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/logs')}
              sx={{ 
                fontSize: '1.2rem', 
                px: 6, 
                py: 1.5,
                borderRadius: 2,
                borderWidth: 2,
                borderColor: 'text.primary',
                color: 'text.primary',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }
              }}
            >
              Open Chronicles
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
          {['D&D 5e', 'D&D 2024', 'Daggerheart', 'Iron Kingdoms'].map((system) => (
            <Grid item key={system}>
              <Paper elevation={3} sx={{ 
                px: 4, 
                py: 2, 
                bgcolor: 'background.paper', 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                minWidth: '160px',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main',
                }
              }}>
                <Typography variant="h6" color="primary.main">{system}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ mt: 'auto', py: 3, opacity: 0.7 }}>
        <Typography variant="body2" color="text.secondary">
          Forged by jorgevvs
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
