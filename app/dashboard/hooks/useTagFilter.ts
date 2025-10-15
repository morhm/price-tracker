import { useMemo, useState } from "react";

export function useTagFilter() {
  const [ selectedTags, setSelectedTags ] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((t) => t !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  }

  const clearTags = () => {
    setSelectedTags([]);
  }

  return {
    selectedTags,
    toggleTag,
    clearTags,
    isFiltering: selectedTags.length > 0,
  };
}