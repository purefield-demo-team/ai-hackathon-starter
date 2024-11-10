// src/components/AgentNodeEditor.tsx

import React from 'react';
import { LlmAgent } from '../models/LlmAgent';
import { LlmAgentNode } from '../models/LlmAgentNode';
import {
  TextField,
  Grid,
  IconButton,
  Typography,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import { ExpandMore, Add, Delete } from '@mui/icons-material';

interface AgentNodeEditorProps {
  node: LlmAgentNode;
  setNode: (node: LlmAgentNode) => void;
  allAgents: LlmAgent[];
  nodeLabel?: string;
}

const AgentNodeEditor: React.FC<AgentNodeEditorProps> = ({
  node,
  setNode,
  allAgents,
  nodeLabel,
}) => {
  const handleOutputAgentChange = (newAgent: LlmAgent | null) => {
    setNode({ ...node, outputAgent: newAgent || ({} as LlmAgent) });
  };

  const addInputAgentNode = () => {
    const newInputNode: LlmAgentNode = {
      outputAgent: {} as LlmAgent,
      inputAgents: [],
    };
    setNode({ ...node, inputAgents: [...node.inputAgents, newInputNode] });
  };

  const updateInputAgentNode = (index: number, updatedNode: LlmAgentNode) => {
    const updatedInputAgents = [...node.inputAgents];
    updatedInputAgents[index] = updatedNode;
    setNode({ ...node, inputAgents: updatedInputAgents });
  };

  const removeInputAgentNode = (index: number) => {
    const updatedInputAgents = [...node.inputAgents];
    updatedInputAgents.splice(index, 1);
    setNode({ ...node, inputAgents: updatedInputAgents });
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle1">{nodeLabel || 'Node'}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={allAgents}
              getOptionLabel={(option) => option.name}
              value={node.outputAgent?.id ? node.outputAgent : null}
              onChange={(event, newValue) => handleOutputAgentChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Output Agent" />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Input Agent Nodes</Typography>
            {node.inputAgents.map((inputNode, index) => (
              <AgentNodeEditor
                key={inputNode.id}
                node={inputNode}
                setNode={(updatedNode) => updateInputAgentNode(index, updatedNode)}
                allAgents={allAgents}
                nodeLabel={`Input Node ${index + 1}`}
              />
            ))}
            <Button
              startIcon={<Add />}
              variant="outlined"
              color="primary"
              onClick={addInputAgentNode}
              style={{ marginTop: '8px' }}
            >
              Add Input Agent Node
            </Button>
          </Grid>
          {nodeLabel !== 'Start Node' && (
            <Grid item xs={12}>
              <IconButton
                color="secondary"
                onClick={() => removeInputAgentNode(0)}
              >
                <Delete />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default AgentNodeEditor;