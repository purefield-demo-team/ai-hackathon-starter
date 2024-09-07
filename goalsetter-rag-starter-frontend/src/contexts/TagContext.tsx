import React, { createContext, useState, useContext } from 'react';
import { Tag } from '../models/Tag';  // import your Tag model

interface TagContextType {
  selectedTags: Tag[];  // Now it should contain Tag[] instead of string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;  // adjust this as well
}

const TagContext = createContext<TagContextType | null>(null);

interface TagProviderProps {
  children: React.ReactNode;
}

export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);  // rename this to selectedTags

  return (
    <TagContext.Provider value={{ selectedTags, setSelectedTags }}> 
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagContext);
  if (context === null) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};
