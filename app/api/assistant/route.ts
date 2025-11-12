import { openai } from '@/lib/openai';
import { SYSTEM_PROMPTS } from './prompts'
import { ToolCall } from './types';
import { tools } from './tools';
import { EbayProvider } from '@/app/providers/ebay';
import { PrismaClient } from '@/app/generated/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const interpretIntentWithLLM = async (prompt: string): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.INTERPRET_QUERY },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.2,
  });

  console.log('LLM result:', completion.choices[0].message?.content);

  return completion.choices[0].message?.content || '';
}

const generateToolsResponse = async (intent: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.GENERATE_TOOLS_RESPONSE },
      { role: 'user', content: intent }
    ],
    tools,
    max_tokens: 500,
    temperature: 0.3,
  });

  console.log('Tools response LLM result:', completion.choices[0].message);

  return completion.choices[0].message;
}

const selectTopListings = async (userPrompt: string, listings: any[]): Promise<any[]> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.SELECT_TOP_LISTINGS },
      { role: 'user', content: `User query: ${userPrompt}\n\nListings:\n${JSON.stringify(listings, null, 2)}` }
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  let response = completion.choices[0].message?.content || '[]';
  console.log('Top listings selection raw:', response);

  // Remove markdown code block formatting if present
  response = response.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  console.log('Top listings selection cleaned:', response);

  return JSON.parse(response);
}

const generateTrackerName = async (userPrompt: string, listings: any[]): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.GENERATE_TRACKER_NAME },
      { role: 'user', content: `User query: ${userPrompt}\n\nListings:\n${JSON.stringify(listings, null, 2)}` }
    ],
    max_tokens: 100,
    temperature: 0.3,
  });

  let response = completion.choices[0].message?.content || '{"name": "Price Tracker"}';
  console.log('Generated tracker name raw:', response);

  // Remove markdown code block formatting if present
  response = response.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  console.log('Generated tracker name cleaned:', response);

  const parsed = JSON.parse(response);
  return parsed.name;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { prompt } = await request.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
  }

  try {
    const intent = await interpretIntentWithLLM(prompt);

    const toolsResponse = await generateToolsResponse(intent);
    const toolCalls = toolsResponse.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return new Response(JSON.stringify({
        intent,
        message: toolsResponse.content
      }), { status: 200 });
    }

    // Execute tool calls
    const results = [];
    let allListings: any[] = [];

    for (const toolCall of toolCalls) {
      if (toolCall.type === 'function' && toolCall.function.name === 'search_provider') {
        const args = JSON.parse(toolCall.function.arguments);

        if (args.provider === 'ebay') {
          const listings = await EbayProvider.getListings(args.query);
          console.log('Listings from eBay provider:', listings);
          allListings = allListings.concat(listings);
          results.push({
            toolCall: toolCall.function.name,
            provider: args.provider,
            query: args.query,
            listings
          });
        }
      }
    }

    console.log('Final results from tool calls:', results);

    // Select top 3 most relevant listings
    const topListings = allListings.length > 0
      ? await selectTopListings(prompt, allListings)
      : [];

    // Generate tracker name and create tracker
    let tracker = null;
    if (topListings.length > 0) {
      const trackerName = await generateTrackerName(prompt, topListings);

      const prisma = new PrismaClient();

      try {
        // Create tracker with listings
        tracker = await prisma.tracker.create({
          data: {
            userId: parseInt(session.user.id),
            title: trackerName,
            description: prompt,
            listings: {
              create: topListings.map((listing: any) => ({
                title: listing.title,
                url: listing.url,
                domain: new URL(listing.url).hostname,
                currentPrice: listing.price,
                isAvailable: listing.isAvailable,
                lastCheckedAt: new Date(),
              }))
            }
          },
          include: {
            listings: true
          }
        });

        console.log('Created tracker:', tracker);
      } finally {
        await prisma.$disconnect();
      }
    }

    return new Response(JSON.stringify({
      success: true,
      tracker: tracker ? {
        id: tracker.id,
        title: tracker.title,
        description: tracker.description,
        listingsCount: tracker.listings.length
      } : null
    }), { status: 200 });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI response' }), { status: 500 });
  }
}