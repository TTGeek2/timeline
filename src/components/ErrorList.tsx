import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Divider
} from '@mui/material';
import { format, isValid } from 'date-fns';

interface LogData {
  timestamp: Date;
  error: string;
  file: string;
}

interface ErrorListProps {
  logData: LogData[];
  onErrorSelect: (error: string) => void;
  selectedError: string | null;
}

const ErrorList: React.FC<ErrorListProps> = ({ logData, onErrorSelect, selectedError }) => {
  // Group errors and count occurrences
  const errorGroups = React.useMemo(() => {
    const groups = new Map<string, { count: number; occurrences: LogData[] }>();
    
    logData.forEach(log => {
      const existing = groups.get(log.error);
      if (existing) {
        existing.count++;
        existing.occurrences.push(log);
      } else {
        groups.set(log.error, { count: 1, occurrences: [log] });
      }
    });

    // Convert to array and sort by count
    return Array.from(groups.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [logData]);

  const formatDate = (date: Date) => {
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'PPpp');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Top 15 Errors
      </Typography>
      
      <List>
        {errorGroups.map((group, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedError === group.error}
                onClick={() => onErrorSelect(group.error)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" noWrap>
                        {group.error}
                      </Typography>
                      <Chip
                        label={group.count}
                        size="small"
                        color="primary"
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
            {index < errorGroups.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ErrorList; 