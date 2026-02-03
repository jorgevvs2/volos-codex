import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Based on the C# Enum RpgSystem
const RpgSystems = {
  'D&D 2024': 0,
  'D&D 5e': 1,
  'Daggerheart': 2,
  'Reinos de Ferro': 3,
};

type RpgSystemName = keyof typeof RpgSystems;

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<RpgSystemName>('D&D 5e');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        prompt: userMessage.text,
        sistema: RpgSystems[selectedSystem]
      };

      console.log('Sending payload:', payload);

      const response = await fetch('/api/Questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      const botResponseText = data.answer || data.Answer;

      if (!botResponseText) {
          console.warn('Response JSON does not contain "answer" or "Answer" field:', data);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText || "Sorry, I received an empty response.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
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
    <div className="chat-container">
      <div className="chat-history">
        {messages.length === 0 && (
          <div className="welcome-message" style={{ textAlign: 'center', marginTop: '20vh', color: '#5f6368' }}>
            <h2>Welcome to Volos Codex</h2>
            <p>Ask me anything about your RPG rules.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
            {msg.sender === 'bot' && (
              <div className="avatar bot-avatar">AI</div>
            )}
            <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="avatar user-avatar">You</div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="avatar bot-avatar">AI</div>
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <form onSubmit={handleSendMessage} className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <div className="controls-container">
            <select 
              className="system-selector"
              value={selectedSystem} 
              onChange={(e) => setSelectedSystem(e.target.value as RpgSystemName)}
              disabled={isLoading}
            >
              {Object.keys(RpgSystems).map(systemName => (
                <option key={systemName} value={systemName}>
                  {systemName}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!inputValue.trim() || isLoading}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill={!inputValue.trim() || isLoading ? "#ccc" : "#0b57d0"}/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
