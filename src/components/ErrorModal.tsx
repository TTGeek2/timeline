import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  IconButton,
  Stack,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WARN';
}

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  error: LogData | null;
  errorGroup?: {
    message: string;
    occurrences: LogData[];
  };
  currentErrorIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  open, 
  onClose, 
  error, 
  errorGroup,
  currentErrorIndex,
  onNavigate 
}) => {
  const theme = useTheme();
  if (!error) return null;

  // Split message into first line and stack trace
  const [firstLine, ...stackTraceLines] = error.message.split('\n');
  const stackTrace = stackTraceLines.join('\n').trim();

  const canNavigate = errorGroup && errorGroup.occurrences.length > 1;
  const currentPosition = currentErrorIndex !== undefined && errorGroup 
    ? `${currentErrorIndex + 1} of ${errorGroup.occurrences.length}`
    : undefined;

  const isError = error.level === 'ERR';
  const color = isError ? theme.palette.error : theme.palette.warning;
  const Icon = isError ? ErrorIcon : WarningIcon;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon sx={{ color: color.main }} />
          <Typography variant="h6">
            {isError ? 'Error' : 'Warning'} Details
          </Typography>
        </Box>
        {canNavigate && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {currentPosition}
            </Typography>
            <IconButton 
              onClick={() => onNavigate?.('prev')}
              disabled={currentErrorIndex === 0}
              size="small"
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton 
              onClick={() => onNavigate?.('next')}
              disabled={currentErrorIndex === errorGroup.occurrences.length - 1}
              size="small"
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Timestamp
          </Typography>
          <Typography variant="body1">
            {format(error.timestamp, 'MMMM d, yyyy HH:mm:ss.SSS')}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Source File
          </Typography>
          <Typography variant="body1">
            {error.file}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {isError ? 'Error' : 'Warning'} Message
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2,
              bgcolor: color.main,
              color: color.contrastText
            }}
          >
            <Typography variant="body1">
              {firstLine}
            </Typography>
          </Paper>
        </Box>

        {stackTrace && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Stack Trace
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                bgcolor: 'grey.100',
                overflow: 'auto'
              }}
            >
              <Typography 
                variant="body2" 
                component="pre"
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  p: 2,
                  m: 0,
                  maxHeight: '300px'
                }}
              >
                {stackTrace}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal; 