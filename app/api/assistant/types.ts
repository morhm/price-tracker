export type SearchIntent = {
  keywords: string;
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  condition?: 'new' | 'used';
  brand?: string;
  notes?: string;
}

export type ToolCall = {
  name: string;
  parameters: Record<string, any>;
  reasoning: string;
}