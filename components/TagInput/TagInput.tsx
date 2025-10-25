'use client';

import { useState } from 'react';
import { Tag } from './Tag';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: { id: number; name: string; color: string }[];
  placeholder?: string;
}

export default function TagInput({
  tags,
  onChange,
  availableTags = [],
  placeholder = 'Add a tag and press Enter',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSuggestions = availableTags.filter(tag => {
    const matchesInput = inputValue === '' || tag.name.toLowerCase().includes(inputValue.toLowerCase());
    const notAlreadySelected = !tags.includes(tag.name);
    return matchesInput && notAlreadySelected;
  });

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (tagName: string) => {
    addTag(tagName);
    setInputValue('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="border border-gray-300 rounded-md p-2 flex flex-wrap gap-2">
        {tags.map(tag => {
          const tagData = availableTags.find(t => t.name === tag);
          return (
            <Tag
              name={tag}
              color={tagData?.color}
              onRemove={removeTag}
            />
          );
        })}
        <input
          type="text"
          className="flex-grow outline-none p-1"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
        />
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
              onClick={() => handleSuggestionClick(tag.name)}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}