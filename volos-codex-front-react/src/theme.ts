import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode (Parchment/Scroll style)
          primary: {
            main: '#8B0000', // Dark Red / Crimson
            light: '#B22222',
            dark: '#500000',
            contrastText: '#FFF8DC',
          },
          secondary: {
            main: '#C5A059', // Gold / Bronze
            light: '#E6C27A',
            dark: '#947636',
            contrastText: '#1A1A1D',
          },
          background: {
            default: '#F5E6D3', // Parchment
            paper: '#FFF8DC',   // Cornsilk
          },
          text: {
            primary: '#2F1B0C', // Dark Brown
            secondary: '#5C4033', // Lighter Brown
          },
          divider: '#D2B48C', // Tan
        }
      : {
          // Dark Mode (Dungeon/Mystic style)
          primary: {
            main: '#FF6347', // Tomato Red (brighter for dark mode)
            light: '#FF8C75',
            dark: '#B22222',
            contrastText: '#1A1A1D',
          },
          secondary: {
            main: '#FFD700', // Gold
            light: '#FFE44D',
            dark: '#B8860B',
            contrastText: '#1A1A1D',
          },
          background: {
            default: '#121212', // Very Dark Grey
            paper: '#1E1E1E',   // Dark Grey
          },
          text: {
            primary: '#E0E0E0', // Off-white
            secondary: '#A0A0A0', // Grey
          },
          divider: '#333333',
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Cinzel", serif', fontWeight: 700, letterSpacing: '0.05em' },
    h2: { fontFamily: '"Cinzel", serif', fontWeight: 700, letterSpacing: '0.03em' },
    h3: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h4: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h5: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    h6: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
    subtitle1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.6,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8, // Slightly sharper corners for a classic feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Classic RPG button shape
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default gradient in dark mode
        },
        rounded: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', // Subtle border effect
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '2px solid', // Thicker border for header
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: {
          scrollbarColor: themeParam.palette.mode === 'dark' ? '#555 #1e1f20' : '#D2B48C #F5E6D3',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: themeParam.palette.mode === 'dark' ? '#555' : '#D2B48C',
            minHeight: 24,
            border: `2px solid ${themeParam.palette.background.default}`,
          },
        },
        code: {
          fontFamily: '"JetBrains Mono", monospace',
        },
      }),
    },
  },
});
