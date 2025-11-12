export interface ListingProvider {
  name: string;
  getListings: (query: string) => Promise<any[]>;
}

export interface ListingResult {
  title: string;
  price: number | null;
  isAvailable: boolean;
  imageUrl: string | null;
  url: string;
  source: 'ebay' | 'walmart' | 'custom';
}

interface ProviderMetadata {
  name: string;
  description: string;
  categories: string[];
  supportsFilter?: string[];
}

const providerRegistry: ProviderMetadata[] = [
  {
    name: 'ebay',
    description: 'Large auction and resale marketplace',
    categories: ['vintage', 'collectibles', 'electronics', 'clothes', 'furniture'],
  },
  {
    name: 'walmart',
    description: 'Mainstream consumer goods',
    categories: ['electronics', 'home'],
  },
];
