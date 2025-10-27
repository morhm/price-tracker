import Link from 'next/link';
import { TrackerData } from '../types';

interface TrackerProps {
  id: number;
  title: string;
  description?: string;
  targetPrice?: number;
  lowestAvailablePrice?: number;
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  count: {
    listings: number;
  };
  updatedAt: string;
  showArchived: boolean;
  handleOpenTrackerDropdown: (id: number) => void;
  openDropdownId: number | null;
  handleArchiveTracker: (tracker: TrackerData) => void;
  handleDeleteTracker: (tracker: TrackerData) => void;
}

export const Tracker = ({
  id,
  title,
  description,
  targetPrice,
  lowestAvailablePrice,
  tags,
  count,
  updatedAt,
  showArchived,
  handleOpenTrackerDropdown,
  openDropdownId,
  handleArchiveTracker,
  handleDeleteTracker
}: TrackerProps) => {
  return (
    <Link
      href={`/tracker/${id}`}
      className={`rounded-lg shadow hover:shadow-lg transition-all p-6 group cursor-pointer ${showArchived ? 'bg-gray-100 border border-gray-300' : 'bg-white'
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h3>
        <div className="relative" data-dropdown-id={id}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOpenTrackerDropdown(id);
            }}
            className={`hover:text-gray-700 transition-opacity ${openDropdownId === id
              ? 'text-gray-900 opacity-100'
              : 'text-gray-500 opacity-0 group-hover:opacity-100'
              }`}
            title="Options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          {openDropdownId === id && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleArchiveTracker({ id, title, tags, _count: count, updatedAt } as TrackerData);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Archive
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteTracker({ id, title, tags, _count: count, updatedAt } as TrackerData);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        {
          !!lowestAvailablePrice ? (
            <div className="text-left">
              <p className="text-xs text-gray-500">Lowest Available Price</p>
              <p className="text-sm font-medium text-blue-600">
                ${lowestAvailablePrice}
              </p>
            </div>
          ) : null
        }
        {targetPrice && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Target Price</p>
            <p className="text-sm font-medium text-green-600">
              ${targetPrice}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-block text-white text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-400 mt-3">
        Updated {new Date(updatedAt).toLocaleDateString()}
      </p>
    </Link>
  )
}