import { useState } from 'react';

interface TagFilterProps {
  allTags: { id: number; name: string; color: string }[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  selectedTags: string[];
}

export const TagFilter = ({ allTags, selectedTags, toggleTag, clearTags }: TagFilterProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  const handleTagSelect = (tagName: string) => {
    toggleTag(tagName);
    setInputValue('');
    setShowDropdown(false);
  };

  const removeTag = (tagName: string) => {
    toggleTag(tagName);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">Tags:</label>
      <div className="relative flex-1 max-w-2xl">
        <div className="border border-gray-300 rounded-md p-2 flex flex-wrap gap-2 min-h-[42px]">
          {selectedTags.map(tag => {
            const tagData = allTags.find(t => t.name === tag);
            return (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: tagData?.color || '#3B82F6' }}
              >
                {tag}
                <button
                  type="button"
                  className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                  onClick={() => removeTag(tag)}
                >
                  &times;
                </button>
              </span>
            );
          })}
          <input
            type="text"
            className="flex-grow outline-none p-1 min-w-[120px]"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={selectedTags.length === 0 ? "Search and select tags..." : ""}
          />
        </div>
        {showDropdown && filteredTags.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                onClick={() => handleTagSelect(tag.name)}
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
    </div>
  );
}