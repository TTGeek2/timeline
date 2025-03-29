import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box,
  Typography,
  Paper,
  IconButton
} from '@mui/material';
import FileUpload from './components/FileUpload';
import ErrorList from './components/ErrorList';
import Timeline from './components/Timeline';
import { ExpandLess } from '@mui/icons-material';
import { ExpandMore } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [logData, setLogData] = useState<any[]>([]);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleFileUpload = (data: any[]) => {
    setLogData(data);
  };

  const handleErrorSelect = (error: string) => {
    setSelectedError(error);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Log4Net Analyzer
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <FileUpload onFileUpload={handleFileUpload} />
          </Paper>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              flex: 2,
              transition: 'height 0.3s ease',
              height: collapsed ? '60px' : 'auto',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: collapsed ? 0 : 2 }}>
              <IconButton onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>
            <Timeline 
              logData={logData} 
              selectedError={selectedError}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <ErrorList 
              logData={logData} 
              onErrorSelect={handleErrorSelect}
              selectedError={selectedError}
            />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
