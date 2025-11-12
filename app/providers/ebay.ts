import { ListingProvider, ListingResult } from './types';
import { getRedisClient } from '@/lib/redis';

// https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=drone&limit=3

export const EbayProvider: ListingProvider &
  {
     getEbayAccessToken: () => Promise<string>,
    fetchNewToken: () => Promise<{ accessToken: string; expiresIn: number }>
  } = {
  name: "ebay",

  async getListings(query: string): Promise<ListingResult[]> {
    const accessToken = await this.getEbayAccessToken();

    const queryUrl = new URL('https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search');
    queryUrl.searchParams.append('q', query);
    queryUrl.searchParams.append('limit', '5');

    const response = await fetch(queryUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`eBay API error: ${response.status} ${text}`);
    }
    
    const data = await response.json();

    console.log('bloop ebay data:', data);

    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      // Return mock data for sandbox since it's often empty
      console.log('No results from sandbox, returning mock data');
      return [
        {
          title: 'DJI Mini 3 Pro Drone with Remote Controller',
          price: 759.00,
          isAvailable: true,
          url: 'https://www.ebay.com/itm/example1',
          imageUrl: 'https://i.ebayimg.com/images/g/mock1/s-l500.jpg',
          source: 'ebay' as const,
        },
        {
          title: 'Holy Stone HS720E Drone with 4K Camera',
          price: 299.99,
          isAvailable: true,
          url: 'https://www.ebay.com/itm/example2',
          imageUrl: 'https://i.ebayimg.com/images/g/mock2/s-l500.jpg',
          source: 'ebay' as const,
        },
        {
          title: 'Potensic ATOM SE Mini Drone',
          price: 229.99,
          isAvailable: true,
          url: 'https://www.ebay.com/itm/example3',
          imageUrl: 'https://i.ebayimg.com/images/g/mock3/s-l500.jpg',
          source: 'ebay' as const,
        },
        {
          title: 'DJI Mavic Air 2 Fly More Combo',
          price: 988.00,
          isAvailable: true,
          url: 'https://www.ebay.com/itm/example4',
          imageUrl: 'https://i.ebayimg.com/images/g/mock4/s-l500.jpg',
          source: 'ebay' as const,
        },
        {
          title: 'Ruko F11GIM2 Drone with 4K Camera',
          price: 449.99,
          isAvailable: true,
          url: 'https://www.ebay.com/itm/example5',
          imageUrl: 'https://i.ebayimg.com/images/g/mock5/s-l500.jpg',
          source: 'ebay' as const,
        },
      ];
    }

    return data.itemSummaries.map((item: any) => ({
      title: item.title,
      price: parseFloat(item.price?.value || '0'),
      isAvailable: true,
      url: item.itemWebUrl,
      imageUrl: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
      source: 'ebay' as const,
    }));
  },

  async getEbayAccessToken(): Promise<string> {
    const redis = getRedisClient();
  
    // Try cache first
    const cached = await redis.get("ebay_token");
    const cachedParsed = cached ? JSON.parse(cached) : null;
    const expiresAt = cachedParsed ? cachedParsed.expiresAt : 0;
    const token = cachedParsed ? cachedParsed.token : null;
  
    if (cached && expiresAt > Date.now() + 5 * 60 * 1000) {
      // Valid for more than 5 minutes → reuse it
      return token;
    }
  
    // 2️⃣ Fetch new token from eBay
    const newToken = await this.fetchNewToken();
  
    // 3️⃣ Store in Redis with TTL
    const ttlSeconds = Math.floor(newToken.expiresIn - 60); // buffer 1 min before expiry
    await redis.set(
      "ebay_token",
      JSON.stringify({ token: newToken.accessToken, expiresAt: Date.now() + ttlSeconds * 1000 }),
      { EX: ttlSeconds }
    );
  
    return newToken.accessToken;
  },

  async fetchNewToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Missing eBay client credentials.");
    }
  
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenUrl = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    });
  
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch eBay token: ${response.status} ${text}`);
    }
  
    const json = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
  
    console.log("🔄 Refreshed eBay access token");
  
    return { accessToken: json.access_token, expiresIn: json.expires_in };
  }
}
