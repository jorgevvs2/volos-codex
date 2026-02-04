import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../Contexts/AuthContext';

interface HeaderProps {
  activeSection?: string;
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ activeSection = 'chat', toggleColorMode, mode }) => {
  const { user, handleLoginSuccess, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <AutoStoriesIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
            Volo's Codex
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant={activeSection === 'chat' ? 'contained' : 'text'}
            disableElevation
            sx={{ 
              borderRadius: 4,
              textTransform: 'none',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
              ...(activeSection === 'chat' && {
                bgcolor: mode === 'light' ? 'primary.light' : 'primary.main',
                color: mode === 'light' ? 'primary.contrastText' : 'background.default',
                '&:hover': {
                  bgcolor: mode === 'light' ? 'primary.main' : 'primary.light',
                  color: mode === 'light' ? 'white' : 'background.default',
                }
              }),
              ...(activeSection !== 'chat' && {
                color: 'text.secondary',
              })
            }}
          >
            Chat with AI
          </Button>
          
          <IconButton sx={{ ml: 1, mr: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* User Profile / Login */}
          {user ? (
            <Box>
              <Tooltip title={user.name}>
                <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                  <Avatar alt={user.name} src={user.picture} />
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
              >
                <MenuItem disabled>{user.email}</MenuItem>
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
