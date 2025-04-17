import React, { useState, useMemo } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box,
  Typography,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import FileUpload from './components/FileUpload';
import ErrorList from './components/ErrorList';
import Timeline from './components/Timeline';
import { ExpandLess } from '@mui/icons-material';
import { ExpandMore } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WARN';
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
});

function App() {
  const [logData, setLogData] = useState<LogData[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [logType, setLogType] = useState<'ERR' | 'WARN'>('ERR');

  const handleFileUpload = (data: LogData[]) => {
    setLogData(data);
    setSelectedMessage(null);
  };

  const handleMessageSelect = (message: string | null) => {
    setSelectedMessage(message);
  };

  const handleLogTypeChange = (_: React.MouseEvent<HTMLElement>, newLogType: 'ERR' | 'WARN' | null) => {
    if (newLogType !== null) {
      setLogType(newLogType);
      setSelectedMessage(null);
    }
  };

  const filteredLogData = useMemo(() => {
    return logData.filter(entry => entry.level === logType);
  }, [logData, logType]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Log4Net Analyzer
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FileUpload onFileUpload={handleFileUpload} />
              <ToggleButtonGroup
                value={logType}
                exclusive
                onChange={handleLogTypeChange}
                aria-label="log type"
                size="small"
              >
                <ToggleButton 
                  value="ERR" 
                  aria-label="errors"
                  sx={{ 
                    '&.Mui-selected': { 
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.lighter' }
                    }
                  }}
                >
                  <ErrorIcon sx={{ mr: 1 }} />
                  Errors
                </ToggleButton>
                <ToggleButton 
                  value="WARN" 
                  aria-label="warnings"
                  sx={{ 
                    '&.Mui-selected': { 
                      color: 'warning.main',
                      '&:hover': { bgcolor: 'warning.lighter' }
                    }
                  }}
                >
                  <WarningIcon sx={{ mr: 1 }} />
                  Warnings
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: collapsed ? 0 : 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {selectedMessage ? 'Showing selected entry' : 'Showing all entries'}
              </Typography>
              <IconButton onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>
            <Timeline 
              logData={filteredLogData} 
              selectedError={selectedMessage}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <ErrorList 
              logData={filteredLogData} 
              onErrorSelect={handleMessageSelect}
              selectedError={selectedMessage}
            />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
