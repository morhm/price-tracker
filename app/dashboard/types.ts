export interface TrackerData {
  id: number;
  title: string;
  description?: string;
  targetPrice?: number;
  lowestAvailablePrice?: number;
  createdAt: string;
  updatedAt: string;
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
  _count: {
    listings: number;
  };
}
