import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, PaletteMode } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { getTheme } from './theme';
import ChatWindow from './Components/Chat/ChatWindow';
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';
import CampaignTrackPage from './Components/Logs/CampaignTrackPage';
import CampaignDetailsPage from './Components/Logs/CampaignDetailsPage';
import SessionDetailsPage from './Components/Logs/SessionDetailsPage';
import { AuthProvider } from './Contexts/AuthContext';

// REPLACE WITH YOUR ACTUAL CLIENT ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function AppContent() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'light';
  });

  const theme = useMemo(() => getTheme(mode), [mode]);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const getActiveSection = (path: string) => {
    if (path === '/chat') return 'chat';
    if (path.startsWith('/logs')) return 'logs';
    return 'home';
  };

  const activeSection = getActiveSection(location.pathname);

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
          activeSection={activeSection}
          toggleColorMode={toggleColorMode} 
          mode={mode} 
        />

        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatWindow />} />
            <Route path="/logs" element={<CampaignTrackPage />} />
            <Route path="/logs/:campaignId" element={<CampaignDetailsPage />} />
            <Route path="/logs/:campaignId/sessions/:sessionNumber" element={<SessionDetailsPage />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
