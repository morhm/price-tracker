export interface TrackerData {
  id: number;
  title: string;
  description?: string;
  targetPrice?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  listings: Array<{
    id: number;
    title: string;
    url: string;
    domain: string;
    currentPrice: number;
    isAvailable: boolean;
    lastCheckedAt: string;
  }>;
  _count: {
    listings: number;
  };
}
