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
  Button,
  Tooltip
} from '@mui/material';
import { format, isValid } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
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

  // Function to check if two error groups have temporal overlap
  const hasTemporalOverlap = (group1: LogData[], group2: LogData[]): boolean => {
    // Create sets of 15-minute intervals for each group
    const getIntervals = (logs: LogData[]): Set<string> => {
      const intervals = new Set<string>();
      logs.forEach(log => {
        // Round to nearest 15 minutes for consistency with timeline
        const time = log.timestamp.getTime();
        const interval = Math.floor(time / (15 * 60 * 1000)) * (15 * 60 * 1000);
        intervals.add(interval.toString());
      });
      return intervals;
    };

    const intervals1 = getIntervals(group1);
    const intervals2 = getIntervals(group2);

    // Check for any common intervals
    for (const interval of Array.from(intervals1)) {
      if (intervals2.has(interval)) {
        return true;
      }
    }
    return false;
  };

  // Group messages and count occurrences
  const messageGroups = React.useMemo(() => {
    const groups = new Map<string, { count: number; occurrences: LogData[] }>();
    
    for (let i = 0; i < logData.length; i++) {
      const log = logData[i];
      const existing = groups.get(log.message);
      if (existing) {
        existing.count++;
        existing.occurrences.push(log);
      } else {
        groups.set(log.message, { count: 1, occurrences: [log] });
      }
    }

    // Convert to array and sort by count
    return Array.from(groups.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);
  }, [logData]);

  // Find the selected group's data
  const selectedGroupData = React.useMemo(() => {
    if (!selectedError) return null;
    return messageGroups.find(group => group.message === selectedError);
  }, [selectedError, messageGroups]);

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
          Top {messageGroups.length} {logData[0]?.level === 'ERR' ? 'Error' : 'Warning'} groups, with a total of {messageGroups.map(a => a.count).reduce((a, b) => a + b, 0)} occurrences
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
        {messageGroups.map((group, index) => {
          const hasOverlap = selectedError && selectedGroupData && 
            group.message !== selectedError && 
            hasTemporalOverlap(group.occurrences, selectedGroupData.occurrences);

          return (
            <React.Fragment key={index}>
              <ListItem 
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {hasOverlap && (
                      <Tooltip title="Has errors in same time intervals as selected group">
                        <TimelineIcon 
                          sx={{ 
                            mr: 1,
                            color: 'primary.main',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      </Tooltip>
                    )}
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
                  </Box>
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
          );
        })}
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

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default ErrorList; 