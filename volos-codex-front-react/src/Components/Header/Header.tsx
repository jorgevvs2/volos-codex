import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Tooltip, useTheme } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeSection?: string;
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ activeSection = 'chat', toggleColorMode, mode }) => {
  const { user, handleLoginSuccess, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const getButtonStyle = (sectionName: string) => ({
    borderRadius: 4,
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.05em',
    mx: 1,
    display: { xs: 'none', sm: 'block' },
    ...(activeSection === sectionName ? {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        bgcolor: 'primary.dark',
      }
    } : {
      color: 'text.primary',
      '&:hover': {
        bgcolor: 'action.hover',
        color: 'primary.main',
      }
    }),
  });

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={4} 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <AutoStoriesIcon sx={{ color: 'primary.main', fontSize: 36 }} />
          <Typography variant="h5" component="div" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Volo's Codex
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            variant={activeSection === 'chat' ? 'contained' : 'text'}
            onClick={() => navigate('/chat')}
            sx={getButtonStyle('chat')}
          >
            Chat
          </Button>

          <Button 
            variant={activeSection === 'logs' ? 'contained' : 'text'}
            onClick={() => navigate('/logs')}
            sx={getButtonStyle('logs')}
          >
            Campaigns
          </Button>
          
          <Box sx={{ width: '1px', height: '24px', bgcolor: 'divider', mx: 2 }} />

          <IconButton sx={{ ml: 1, mr: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* User Profile / Login */}
          {user ? (
            <Box>
              <Tooltip title={user.name}>
                <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                  <Avatar alt={user.name} src={user.picture} sx={{ border: `2px solid ${theme.palette.primary.main}` }} />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                  }
                }}
              >
                <MenuItem disabled sx={{ opacity: 0.7, fontSize: '0.8rem' }}>{user.email}</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              theme={mode === 'dark' ? 'filled_black' : 'outline'}
              shape="pill"
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
