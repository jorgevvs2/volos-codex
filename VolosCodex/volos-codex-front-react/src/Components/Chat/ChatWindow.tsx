import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Select, 
  MenuItem, 
  Avatar, 
  FormControl, 
  useTheme,
  Tooltip,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import { SelectChangeEvent } from '@mui/material/Select';
import BotResponse from './BotResponse';
import { useAuth } from '../../Contexts/AuthContext';
import ChatHistorySidebar from './ChatHistorySidebar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSessionData {
  id: string;
  title: string;
  timestamp: Date;
}

const RpgSystems = {
  'D&D 2024': 0,
  'D&D 5e': 1,
  'Daggerheart': 2,
  'Reinos de Ferro': 3,
};

type RpgSystemName = keyof typeof RpgSystems;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Current Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<RpgSystemName>('D&D 5e');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECT: Load Sessions on Auth Change ---
  useEffect(() => {
    if (token) {
      console.log("Token present, fetching sessions from API...");
      fetchSessionsFromApi();
    } else {
      console.log("No token, loading local sessions.");
      loadSessionsFromLocalStorage();
    }
  }, [token]);

  // --- API Functions ---
  const fetchSessionsFromApi = async () => {
    try {
      const response = await fetch('/api/Chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Sessions loaded:", data);
        const apiSessions = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          timestamp: new Date(s.updatedAt)
        }));
        setSessions(apiSessions);
      } else {
        console.error("Failed to fetch sessions:", response.status);
      }
    } catch (error) {
      console.error("Error fetching sessions", error);
    }
  };

  const fetchMessagesFromApi = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/Chat/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: new Date(m.timestamp)
        })));
      }
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LocalStorage Functions ---
  const loadSessionsFromLocalStorage = () => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const loadedSessions = parsed.map((s: any) => ({
          id: s.id,
          title: s.title,
          timestamp: new Date(s.timestamp)
        }));
        setSessions(loadedSessions);
        
        if (loadedSessions.length > 0) {
          const session = parsed.find((s: any) => s.id === loadedSessions[0].id);
          if (session) {
             setCurrentSessionId(session.id);
             setMessages(session.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          }
        } else {
          startNewChat();
        }
      } catch (e) { console.error(e); startNewChat(); }
    } else {
      startNewChat();
    }
  };

  const saveToLocalStorage = (sessionId: string, title: string, msgs: Message[]) => {
    const savedSessions = localStorage.getItem('chatSessions');
    let localSessions = savedSessions ? JSON.parse(savedSessions) : [];
    
    const existingIndex = localSessions.findIndex((s: any) => s.id === sessionId);
    
    const sessionData = {
      id: sessionId,
      title: title,
      messages: msgs,
      timestamp: new Date()
    };

    if (existingIndex >= 0) {
      localSessions[existingIndex] = sessionData;
    } else {
      localSessions.unshift(sessionData);
    }
    
    localStorage.setItem('chatSessions', JSON.stringify(localSessions));
    
    setSessions(localSessions.map((s: any) => ({
      id: s.id,
      title: s.title,
      timestamp: new Date(s.timestamp)
    })));
    setCurrentSessionId(sessionId);
  };

  // --- Actions ---

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (token) {
      fetchMessagesFromApi(sessionId);
    } else {
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        const session = parsed.find((s: any) => s.id === sessionId);
        if (session) {
          setMessages(session.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSystemChange = (event: SelectChangeEvent) => {
    setSelectedSystem(event.target.value as RpgSystemName);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        prompt: userMessage.text,
        sistema: RpgSystems[selectedSystem],
        sessionId: currentSessionId 
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/Questions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const botResponseText = data.answer || data.Answer;
      
      // Update Session ID from response
      let activeSessionId = currentSessionId;
      if (data.sessionId) {
        activeSessionId = data.sessionId;
        setCurrentSessionId(data.sessionId);
      } else if (!activeSessionId) {
        activeSessionId = Date.now().toString();
        setCurrentSessionId(activeSessionId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText || "Sorry, I received an empty response.",
        sender: 'bot',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // --- Persistence Logic ---
      if (token) {
        // Refresh sessions list to show new chat or updated timestamp
        // We call this AFTER setting messages to ensure UI is responsive
        fetchSessionsFromApi();
      } else {
        let title = "New Chat";
        const existingSession = sessions.find(s => s.id === activeSessionId);
        if (existingSession) {
          title = existingSession.title;
        } else {
          title = userMessage.text.substring(0, 30) + (userMessage.text.length > 30 ? '...' : '');
        }
        saveToLocalStorage(activeSessionId!, title, finalMessages);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please check the console for details.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <ChatHistorySidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={startNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Container 
        maxWidth={false} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          py: 2,
          flexGrow: 1,
          maxWidth: '900px !important', 
          mx: 'auto' 
        }}
      >
        <Box sx={{ position: 'absolute', left: 16, top: 80, zIndex: 10 }}>
           {!isSidebarOpen && (
             <IconButton onClick={() => setIsSidebarOpen(true)}>
               <MenuIcon />
             </IconButton>
           )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {!user && messages.length > 0 && (
             <Alert severity="info" sx={{ py: 0, px: 2, fontSize: '0.85rem', width: '100%' }}>
               Sign in to save your history to the cloud.
             </Alert>
          )}
        </Box>

        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          mb: 2, 
          px: 1,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', 
            borderRadius: '4px' 
          },
        }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Welcome to Volos Codex
              </Typography>
              <Typography variant="body1">
                Ask me anything about your RPG rules.
              </Typography>
            </Box>
          )}

          {messages.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.sender === 'user' ? '85%' : '100%' 
              }}
            >
              {msg.sender === 'bot' && (
                <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', mt: 1 }}>
                  <SmartToyIcon />
                </Avatar>
              )}
              
              <Paper 
                elevation={msg.sender === 'user' ? 0 : 1}
                sx={{ 
                  p: 2, 
                  bgcolor: msg.sender === 'user' 
                    ? (theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark') 
                    : 'background.paper',
                  color: msg.sender === 'user' 
                    ? (theme.palette.mode === 'light' ? 'primary.contrastText' : 'primary.contrastText') 
                    : 'text.primary',
                  borderRadius: 2,
                  borderBottomRightRadius: msg.sender === 'user' ? 0 : 2,
                  borderBottomLeftRadius: msg.sender === 'bot' ? 0 : 2,
                  width: '100%'
                }}
              >
                {msg.sender === 'user' ? (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </Typography>
                ) : (
                  <BotResponse text={msg.text} />
                )}
              </Paper>

              {msg.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'primary.main', mt: 1 }} src={user?.picture}>
                  {!user?.picture && <PersonIcon />}
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mt: 1 }}>
                <SmartToyIcon />
              </Avatar>
              <Paper sx={{ p: 2, borderRadius: 2, borderBottomLeftRadius: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '-0.32s' }} />
                  <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '-0.16s' }} />
                  <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }} />
                </Box>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Paper 
          component="form" 
          onSubmit={handleSendMessage}
          elevation={3} 
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            borderRadius: 4,
            bgcolor: 'background.paper',
            flexShrink: 0
          }}
        >
          <TextField
            sx={{ ml: 2, flex: 1 }}
            placeholder="Ask a question..."
            variant="standard"
            InputProps={{ disableUnderline: true }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={selectedSystem}
                onChange={handleSystemChange}
                label="System"
                disableUnderline
                disabled={isLoading}
                sx={{ 
                  fontSize: '0.875rem', 
                  bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'rgba(255,255,255,0.08)', 
                  borderRadius: 4, 
                  px: 1.5, 
                  py: 0.5,
                  '& .MuiSelect-select': { py: 0.5, pr: '24px !important' } 
                }}
              >
                {Object.keys(RpgSystems).map((systemName) => (
                  <MenuItem key={systemName} value={systemName}>
                    {systemName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton 
              type="submit" 
              color="primary" 
              disabled={!inputValue.trim() || isLoading}
              sx={{ p: '10px' }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
        
        <style>
          {`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `}
        </style>
      </Container>
    </Box>
  );
};

export default ChatWindow;
