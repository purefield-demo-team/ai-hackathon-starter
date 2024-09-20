import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import noteService from '../services/noteService';
import { Box } from '@mui/material';

type MUIQuillEditorProps = {
  value?: string; // Add the '?' to make the value prop optional
  onChange: (content: string) => void;
  style?: React.CSSProperties;
};

const MUIQuillEditor: React.FC<MUIQuillEditorProps> = ({ value = '', onChange, style }) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler: () => Promise<void> = async () => {
    const input = document.createElement('input');
  
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
  
    input.onchange = async () => {
      if (input.files) {
        var file: any = input.files[0];
        var formData = new FormData();
  
        formData.append('image', file);
  
        var fileName = file.name;
  
        const res = await noteService.uploadImage(file, fileName);
        // Assuming that uploadImage function returns the image URL after uploading
        // Insert the returned image URL to the editor
        const quillEditor = quillRef.current?.getEditor();
        if (quillEditor) {
          const range = quillEditor.getSelection();
          quillEditor.insertEmbed(range?.index || 0, 'image', res.data[0].url);
        }
      }
      else {
        console.log("No file selected");
      }
    };
  }; 

  useEffect(() => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      const toolbar = quillEditor.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);
    }
  }, [imageHandler]);

  return (
    <Box component="div" className="quill-editor-container">
      <ReactQuill ref={quillRef} value={value} onChange={onChange} style={style}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean'],
            [{ 'color': [] }]
          ],
        }}  
      />
    </Box>
  );
};

export default MUIQuillEditor;
