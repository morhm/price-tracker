'use client';

import { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: { id: number; name: string }[];
}

export default function TagInput({ tags, onChange, availableTags = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSuggestions = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(tag.name)
  );

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
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-grow outline-none p-1"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Add a tag and press Enter"
        />
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              onClick={() => handleSuggestionClick(tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}