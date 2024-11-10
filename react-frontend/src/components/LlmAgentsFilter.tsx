import React, { useState, useEffect } from 'react';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import llmAgentService from '../services/llmAgentService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { LlmAgent } from '../models/LlmAgent';
import CreatedLlmAgentsList from './CreatedLlmAgentsList';
import TagSelect from './TagSelect';
import { Box } from '@mui/material';
import { useTags } from '../contexts/TagContext';

interface LlmAgentsFilterProps {
  keycloakSubject: string | undefined;
  refresh?: boolean;
  addAgentButton?: React.ReactNode;
}

const LlmAgentsFilter: React.FC<LlmAgentsFilterProps> = ({
  keycloakSubject,
  refresh,
  addAgentButton,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const { selectedTags, setSelectedTags } = useTags();
  const [agents, setAgents] = useState<LlmAgent[] | null | undefined>(null);

  const fetchAndSortAgents = async (selectedTags: Tag[] = []): Promise<LlmAgent[] | null> => {
    let fetchedAgents: LlmAgent[] | null = null;

    if (selectedTags.length > 0) {
      const response: StrapiServiceResponse<LlmAgent[]> = await llmAgentService.getByTags(
        selectedTags
      );
      if (response.data) {
        fetchedAgents = response.data;
      }
    } else {
      const response: StrapiServiceResponse<LlmAgent[]> = await llmAgentService.getAll();
      if (response.data) {
        fetchedAgents = response.data;
      }
    }

    fetchedAgents = (fetchedAgents ?? []).sort((a, b) => a.name.localeCompare(b.name));

    return fetchedAgents;
  };

  useEffect(() => {
    fetchAndSortAgents(selectedTags).then(setAgents);
  }, [selectedTags]);

  useEffect(() => {
    const fetchTags = async () => {
      const response: StrapiServiceResponse<Tag[]> = await tagService.getAll(keycloakSubject);
      if (response.data) {
        const updatedTags = [...response.data];
        selectedTags.forEach((initialTag) => {
          if (!updatedTags.find((tag) => tag.id === initialTag.id)) {
            updatedTags.push(initialTag);
          }
        });
        setTags(updatedTags);
      }
    };

    fetchTags();
    fetchAndSortAgents(selectedTags).then(setAgents);
  }, [keycloakSubject, refresh, JSON.stringify(selectedTags)]);

  const handleTagSelection = (selectedTags: Tag[]) => {
    setSelectedTags(selectedTags);
  };

  const deleteAgent = async (id: string | undefined) => {
    if (id) {
      const result = await llmAgentService.delete(id);
      if (!result.error) {
        setAgents(agents?.filter((agent) => agent.id?.toString() !== id) ?? []);
      } else {
        alert(`Error deleting agent: ${result.error.statusText}`);
      }
    }
  };

  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} selectedTags={selectedTags} onSelectionChange={handleTagSelection} />
      <CreatedLlmAgentsList
        agents={agents}
        onDeleteAgent={deleteAgent}
        addAgentButton={addAgentButton}
      />
    </Box>
  );
};

export default LlmAgentsFilter;