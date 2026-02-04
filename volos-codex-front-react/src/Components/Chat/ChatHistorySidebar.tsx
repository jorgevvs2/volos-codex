import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Button, 
  Divider,
  Drawer,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  drawerWidth?: number;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
  drawerWidth = 260
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{ 
            borderRadius: 2, 
            py: 1.5,
            bgcolor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.main',
            color: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.contrastText',
            boxShadow: 'none',
            '&:hover': {
               bgcolor: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
               color: theme.palette.mode === 'light' ? 'white' : 'primary.contrastText',
            }
          }}
        >
          New Chat
        </Button>
      </Box>

      <Typography variant="subtitle2" sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 600 }}>
        Recent
      </Typography>

      <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        {sessions.map((session) => (
          <ListItem key={session.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={session.id === currentSessionId}
              onClick={() => onSelectSession(session.id)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: theme.palette.mode === 'light' ? 'action.selected' : 'rgba(255, 255, 255, 0.08)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'rgba(255, 255, 255, 0.12)',
                  }
                }
              }}
            >
              <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText 
                primary={session.title} 
                primaryTypographyProps={{ 
                  noWrap: true, 
                  fontSize: '0.9rem',
                  color: session.id === currentSessionId ? 'text.primary' : 'text.secondary'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        {sessions.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No history yet.</Typography>
          </Box>
        )}
      </List>
      
      {isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
           <IconButton onClick={onClose}>
             <CloseIcon />
           </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: isOpen ? drawerWidth : 0 }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}
    >
      {/* Mobile Drawer (Temporary) */}
      <Drawer
        variant="temporary"
        open={isOpen && isMobile}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer (Persistent) */}
      <Drawer
        variant="persistent"
        open={isOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            position: 'relative', // Make it sit next to content, not over
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default ChatHistorySidebar;
