import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

const AppLayout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 } }}>
    <Container maxWidth="lg">
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
        }}
      >
        {children}
      </Box>
    </Container>
  </Box>
)

export default AppLayout
