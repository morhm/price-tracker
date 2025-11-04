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
  listingEvents: Array<{
    id: number;
    eventType: string;
    createdAt: string;
    listing: {
      title: string;
      url: string;
    };
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
  listingEvents,
  count,
  updatedAt,
  showArchived,
  handleOpenTrackerDropdown,
  openDropdownId,
  handleArchiveTracker,
  handleDeleteTracker
}: TrackerProps) => {
  // Count event types
  const priceDropsCount = listingEvents.filter(e => e.eventType === 'PRICE_DROP').length;
  const priceIncreasesCount = listingEvents.filter(e => e.eventType === 'PRICE_INCREASE').length;
  const outOfStockCount = listingEvents.filter(e => e.eventType === 'OUT_OF_STOCK').length;
  const backInStockCount = listingEvents.filter(e => e.eventType === 'BACK_IN_STOCK').length;

  // Get unique listing IDs for each event type
  const getUniqueListingCount = (eventType: string) => {
    const listingIds = new Set(
      listingEvents.filter(e => e.eventType === eventType).map(e => e.listing.title)
    );
    return listingIds.size;
  };

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

      {/* Recent Events */}
      {listingEvents.length > 0 && (
        <div className="mb-4 space-y-1">
          {priceDropsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span>{priceDropsCount} price {priceDropsCount === 1 ? 'drop' : 'drops'} in the past 24h</span>
            </div>
          )}
          {priceIncreasesCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{priceIncreasesCount} price {priceIncreasesCount === 1 ? 'increase' : 'increases'} in the past 24h</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Out of stock on {getUniqueListingCount('OUT_OF_STOCK')} {getUniqueListingCount('OUT_OF_STOCK') === 1 ? 'site' : 'sites'}</span>
            </div>
          )}
          {backInStockCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Back in stock on {getUniqueListingCount('BACK_IN_STOCK')} {getUniqueListingCount('BACK_IN_STOCK') === 1 ? 'site' : 'sites'}</span>
            </div>
          )}
        </div>
      )}

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