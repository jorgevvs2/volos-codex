import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode Colors
          primary: {
            main: '#0b57d0', // Google Blue
            light: '#d3e3fd',
            contrastText: '#041e49',
          },
          secondary: {
            main: '#c4eed0', // Light Green
            contrastText: '#0f5132',
          },
          background: {
            default: '#f0f4f9',
            paper: '#ffffff',
          },
          text: {
            primary: '#1f1f1f',
            secondary: '#444746',
          },
        }
      : {
          // Dark Mode Colors
          primary: {
            main: '#a8c7fa', // Lighter Blue for Dark Mode
            light: '#0842a0', // Darker blue for backgrounds
            contrastText: '#041e49', // Dark text on light primary
          },
          secondary: {
            main: '#1b3a2d', // Dark Green container
            contrastText: '#c4eed0', // Light text
          },
          background: {
            default: '#131314', // Gemini Dark Background
            paper: '#1e1f20',   // Slightly lighter for cards
          },
          text: {
            primary: '#e3e3e3',
            secondary: '#c4c7c5',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
    h2: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
    h3: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h4: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h5: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h6: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: {
          scrollbarColor: themeParam.palette.mode === 'dark' ? '#444746 #1e1f20' : '#909090 #f0f4f9',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: themeParam.palette.mode === 'dark' ? '#444746' : '#909090',
            minHeight: 24,
          },
        },
        code: {
          fontFamily: '"JetBrains Mono", monospace',
        },
      }),
    },
  },
});
