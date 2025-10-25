import { useEffect, useRef, useState } from 'react';
import { TagFilter } from './tagFilter';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddTracker: () => void;
  allTags: { id: number; name: string }[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export const Tabs = ({
  activeTab,
  setActiveTab,
  onAddTracker,
  allTags,
  selectedTags = [],
  toggleTag,
  clearTags
}: TabsProps) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => {
              setActiveTab('all');
            }}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setActiveTab('archived');
            }}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'archived'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Archived
          </button>
        </nav>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap justify-end gap-4 items-center">
          {/* Filter Button */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium ${showFilterDropdown
                ? 'bg-gray-100 border-gray-400 text-gray-900'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filter
              {selectedTags.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Filter by Tags</h3>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => clearTags()}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <TagFilter
                    allTags={allTags}
                    selectedTags={selectedTags}
                    clearTags={clearTags}
                    toggleTag={toggleTag}
                  />
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Tracker Button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={onAddTracker}
          >
            Add Tracker
          </button>
        </div>
      </div>
    </div>
  )
}