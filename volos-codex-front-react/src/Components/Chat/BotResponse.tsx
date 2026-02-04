import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

interface BotResponseProps {
  text: string;
}

const BotResponse: React.FC<BotResponseProps> = ({ text }) => {
  return (
    <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
      <ReactMarkdown
        components={{
          // Customizing Paragraphs
          p: ({ children }) => {
            // Check if the paragraph is just a strong tag (often used as a header in your prompt)
            const childArray = React.Children.toArray(children);
            
            if (childArray.length === 1 && React.isValidElement(childArray[0]) && childArray[0].type === 'strong') {
               // Cast to ReactElement with specific props type to access children safely
               const strongElement = childArray[0] as React.ReactElement<{ children: React.ReactNode }>;
               return (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1, color: 'primary.main' }}>
                   <AutoAwesomeIcon fontSize="small" />
                   <Typography variant="subtitle1" component="span" fontWeight="bold">
                     {strongElement.props.children}
                   </Typography>
                 </Box>
               );
            }
            return <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>{children}</Typography>;
          },
          
          // Customizing Strong/Bold text inside paragraphs
          strong: ({ children }) => (
            <Box component="span" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              {children}
            </Box>
          ),

          // Customizing Lists
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 0, listStyle: 'none', mb: 2 }}>
              {children}
            </Box>
          ),

          // Customizing List Items
          li: ({ children }) => {
             return (
              <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <ArrowRightIcon sx={{ color: 'secondary.main', mr: 1, mt: 0.3 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" component="div">{children}</Typography>
                </Box>
              </Box>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
};

export default BotResponse;
