'use client';

import { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

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

  return (
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
        placeholder="Add a tag and press Enter"
      />
    </div>
  );
}