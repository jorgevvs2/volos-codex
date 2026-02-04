import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, PaletteMode } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getTheme } from './theme';
import ChatWindow from './Components/Chat/ChatWindow';
import Header from './Components/Header/Header';
import { AuthProvider } from './Contexts/AuthContext';

// REPLACE WITH YOUR ACTUAL CLIENT ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function AppContent() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'light';
  });

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        bgcolor: 'background.default',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease'
      }}>
        <Header 
          activeSection="chat" 
          toggleColorMode={toggleColorMode} 
          mode={mode} 
        />

        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatWindow />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
