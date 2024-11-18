// ReferenceSelector.tsx

import React, { useState } from 'react';
import { Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';
import { MessageChunk } from '../models/MessageChunk';

interface ReferenceSelectorProps {
  messageChunks: MessageChunk[];
}

const ReferenceSelector: React.FC<ReferenceSelectorProps> = ({ messageChunks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMessageChunk, setSelectedMessageChunk] = useState<MessageChunk | null>(null);
  const unescapedSelectedMessageChunk = selectedMessageChunk?.text?.replace(/\\"/g, '"');
  const handleReferenceClick = (chunk: MessageChunk) => {
    setSelectedMessageChunk(chunk);
    setOpenDialog(true);
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        <Typography variant="subtitle1" style={{ color: 'white' }}>
          References:
        </Typography>
        <div>
          {messageChunks.map((chunk, index) => (
            <Chip
              key={chunk.id || index}
              label={`[${index + 1}]`}
              onClick={() => handleReferenceClick(chunk)}
              style={{ margin: '4px', backgroundColor: 'white', color: '#34473f' }}
            />
          ))}
        </div>
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>{selectedMessageChunk?.note?.name || 'Reference'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div dangerouslySetInnerHTML={{ __html: unescapedSelectedMessageChunk || '' }} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReferenceSelector;
