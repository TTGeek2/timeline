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
import { Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { parse } from 'date-fns';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const logData: any[] = [];
    
    for (const file of files) {
      try {
        const text = await file.text();
        const lines = text.split('\n');
        
        lines.forEach(line => {
          if (line.includes('ERROR')) {
            // Extract timestamp using regex
            const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/);
            if (timestampMatch) {
              const timestampStr = timestampMatch[1];
              // Parse the timestamp string to Date object
              const timestamp = parse(timestampStr, 'yyyy-MM-dd HH:mm:ss,SSS', new Date());
              const errorMessage = line.split('ERROR')[1]?.trim();
              
              if (errorMessage) {
                logData.push({
                  timestamp,
                  error: errorMessage,
                  file: file.name
                });
              }
            }
          }
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    onFileUpload(logData);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Log Files
      </Typography>
      
      <input
        type="file"
        multiple
        accept=".log"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 2 }}
      >
        Select Files
      </Button>

      {files.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {files.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          fullWidth
        >
          Analyze Logs
        </Button>
      )}
    </Box>
  );
};

export default FileUpload; 