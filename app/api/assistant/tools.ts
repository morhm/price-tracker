
const searchProviderTool = {
  type: "function" as const,
  function: {
    name: "search_provider",
    description: "Search for listings from a specific provider",
    parameters: {
      type: "object" as const,
      properties: {
        provider: {
          type: "string",
          enum: ["ebay", "walmart"],
          description: "The listing provider to search from",
        },
        query: {
          type: "string",
          description: "The search query for the product",
        },
        filters: {
          type: "object",
          description: "Optional filters to apply to the search",
          properties: {
            minPrice: {
              type: "number",
              description: "Minimum price filter",
            },
            maxPrice: {
              type: "number",
              description: "Maximum price filter",
            },
          }
        }
      },
      required: ["provider", "query"],
    }
  }
}

const ebaySearchTool = {
  type: "function",
  name: "ebay_search",
  description: "Search for products on eBay.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query for the product.",
      },
      maxResults: {
        type: "integer",
        description: "Maximum number of results to return.",
        default: 5,
      },
    },
    required: ["query"],
  },
};


export const tools = [
  searchProviderTool,
]

export const toolsRegistry = {
  ebay_search: ebaySearchTool,
}