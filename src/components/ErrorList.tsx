import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import { format, isValid } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import ErrorModal from './ErrorModal';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WRN';
}

interface ErrorListProps {
  logData: LogData[];
  onErrorSelect: (message: string | null) => void;
  selectedError: string | null;
}

const ErrorList: React.FC<ErrorListProps> = ({ logData, onErrorSelect, selectedError }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedErrorGroup, setSelectedErrorGroup] = useState<{
    message: string;
    occurrences: LogData[];
  } | null>(null);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

  // Group messages and count occurrences
  const messageGroups = React.useMemo(() => {
    const groups = new Map<string, { count: number; occurrences: LogData[] }>();
    
    logData.forEach(log => {
      const existing = groups.get(log.message);
      if (existing) {
        existing.count++;
        existing.occurrences.push(log);
      } else {
        groups.set(log.message, { count: 1, occurrences: [log] });
      }
    });

    // Convert to array and sort by count
    return Array.from(groups.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [logData]);

  const formatDate = (date: Date) => {
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'PPpp');
  };

  const handleShowDetails = (group: { message: string; occurrences: LogData[] }) => {
    // Sort occurrences by timestamp (most recent first)
    const sortedOccurrences = [...group.occurrences].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    setSelectedErrorGroup({
      message: group.message,
      occurrences: sortedOccurrences
    });
    setCurrentErrorIndex(0);
    setModalOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedErrorGroup) return;
    
    const newIndex = direction === 'next' 
      ? currentErrorIndex + 1 
      : currentErrorIndex - 1;
    
    if (newIndex >= 0 && newIndex < selectedErrorGroup.occurrences.length) {
      setCurrentErrorIndex(newIndex);
    }
  };

  const getChipColor = (level: 'ERR' | 'WRN') => {
    return level === 'ERR' ? 'error' : 'warning';
  };

  const handleGroupClick = (message: string) => {
    if (selectedError === message) {
      onErrorSelect(null); // Deselect if already selected
    } else {
      onErrorSelect(message); // Select the new group
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Top 15 {logData[0]?.level === 'ERR' ? 'Errors' : 'Warnings'}
        </Typography>
        {selectedError && (
          <Button 
            size="small" 
            onClick={() => onErrorSelect(null)}
            sx={{ textTransform: 'none' }}
          >
            Show All
          </Button>
        )}
      </Box>
      
      <List>
        {messageGroups.map((group, index) => (
          <React.Fragment key={index}>
            <ListItem 
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDetails(group);
                  }}
                  sx={{ mr: 1 }}
                >
                  <InfoIcon />
                </IconButton>
              }
            >
              <ListItemButton
                selected={selectedError === group.message}
                onClick={() => handleGroupClick(group.message)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body1" 
                        noWrap 
                        sx={{ maxWidth: { xs: '200px', sm: '300px', md: '500px' } }}
                      >
                        {group.message.split('\n')[0]}
                      </Typography>
                      <Chip
                        label={group.count}
                        size="small"
                        color={getChipColor(group.occurrences[0].level)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      First occurrence: {formatDate(group.occurrences[0].timestamp)}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < messageGroups.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <ErrorModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedErrorGroup(null);
          setCurrentErrorIndex(0);
        }}
        error={selectedErrorGroup?.occurrences[currentErrorIndex] || null}
        errorGroup={selectedErrorGroup || undefined}
        currentErrorIndex={currentErrorIndex}
        onNavigate={handleNavigate}
      />
    </Box>
  );
};

export default ErrorList; 