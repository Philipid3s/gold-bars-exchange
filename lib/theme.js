import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e'
    },
    secondary: {
      main: '#b45309'
    },
    background: {
      default: '#f6f3ee',
      paper: '#ffffff'
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563'
    }
  },
  typography: {
    fontFamily: ['Sora', 'system-ui', 'sans-serif'].join(','),
    h4: {
      fontFamily: ['Fraunces', 'Sora', 'serif'].join(','),
      fontWeight: 600,
      letterSpacing: '-0.02em'
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f6f3ee',
          backgroundImage:
            'radial-gradient(600px 200px at 10% 0%, rgba(15, 118, 110, 0.08), transparent), radial-gradient(700px 220px at 90% 0%, rgba(180, 83, 9, 0.08), transparent)'
        }
      }
    }
  }
})

export default theme
