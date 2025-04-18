import React, { useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WRN';
}

interface FileUploadProps {
  onFileUpload: (data: LogData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev: File[]) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const parseLogLine = (line: string): { timestamp: Date; level: string; message: string } | null => {
    // Match format: "2025-04-17 08:21:24.838 +02:00 [ERR] Message"
    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) ([+-]\d{2}:\d{2}) \[(.*?)\] (.*)$/);
    
    if (match) {
      const [, timestamp, timezone, level, message] = match;
      // Create a date object with timezone offset
      const date = new Date(timestamp);
      const [hours, minutes] = timezone.split(':').map(Number);
      const offsetMinutes = (hours * 60 + minutes) * (timezone.startsWith('+') ? 1 : -1);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset() - offsetMinutes);
      
      return {
        timestamp: date,
        level,
        message
      };
    }
    return null;
  };

  const isStackTraceLine = (line: string): boolean => {
    // Common patterns in stack traces
    return line.trim().startsWith('at ') || // .NET stack trace lines
           line.includes('   at ') ||       // Indented stack trace lines
           line.includes('--- End of ') ||  // End of stack trace markers
           line.includes(' ---> ') ||       // Inner exception markers
           (line.match(/^[\s]*---/) !== null); // Stack trace boundaries
  };

  const normalizeLogLevel = (level: string): 'ERR' | 'WRN' | null => {
    switch (level) {
      case 'ERR': return 'ERR';
      case 'WRN': return 'WRN';
      default: return null;
    }
  };

  const handleUpload = async () => {
    const logData: LogData[] = [];
    
    for (const file of files) {
      try {
        const text = await file.text();
        const lines = text.split('\n');
        
        let currentEntry: LogData | null = null;
        let isCollectingStackTrace = false;
        
        lines.forEach((line: string, index: number) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return; // Skip empty lines
          
          const parsedLine = parseLogLine(trimmedLine);
          
          if (parsedLine) {
            const normalizedLevel = normalizeLogLevel(parsedLine.level);
            if (normalizedLevel) {
              // Start of a new entry
              if (currentEntry) {
                logData.push(currentEntry);
              }
              
              currentEntry = {
                timestamp: parsedLine.timestamp,
                message: parsedLine.message,
                file: file.name,
                level: normalizedLevel
              };
              isCollectingStackTrace = true;
            } else {
              isCollectingStackTrace = false;
            }
          } else if (currentEntry && isCollectingStackTrace) {
            // Check if this line is part of the stack trace
            if (isStackTraceLine(trimmedLine)) {
              currentEntry.message += '\n' + trimmedLine;
            } else {
              // If we hit a line that's not a stack trace and not a timestamp,
              // keep collecting if the next line looks like a stack trace
              const nextLine = lines[index + 1]?.trim();
              if (nextLine && isStackTraceLine(nextLine)) {
                currentEntry.message += '\n' + trimmedLine;
              } else {
                isCollectingStackTrace = false;
              }
            }
          }
        });
        
        // Add the last entry if exists
        if (currentEntry) {
          logData.push(currentEntry);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    console.log('Parsed log data:', logData);
    onFileUpload(logData);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Log Files
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
          accept=".txt,.log"
        />
        <Button
          variant="contained"
          onClick={() => fileInputRef.current?.click()}
          sx={{ mr: 2 }}
        >
          Select Files
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0}
        >
          Upload and Process
        </Button>
      </Box>

      {files.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files:
          </Typography>
          <List dense>
            {files.map((file: File, index: number) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload; 