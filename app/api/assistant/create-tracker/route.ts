import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const INTERPRET_QUERY_PROMPT = `
You are an assistant that interprets user queries to create price trackers.

Given a natural language query, extract:
1. title: A concise title for the tracker (2-6 words)
2. description: A detailed description of what the user wants to track

Return ONLY a JSON object with these fields.
Example: {"title": "Gaming Laptops", "description": "High-performance gaming laptops with RTX 4060 or better, 16GB+ RAM"}
`;

const SELECT_TAGS_PROMPT = `
You are an assistant that selects relevant tags for a tracker based on the user's query and available tags.

Given a user's tracker query and their available tags, select up to 3 tags that are most relevant.

Return ONLY a JSON array of tag names.
Example: ["Electronics", "Gaming"]
`;

const GENERATE_SUGGESTION_PROMPT = `
You are a shopping assistant that provides helpful suggestions on which products to look for, brands to consider, and retailers to check.

Given a tracker description, generate a helpful shopping suggestion (1-2 sentences) that guides the user on what to look for, when to buy, or how to get the best value.

Return ONLY the suggestion text, no formatting or extra text.
Example: "Consider BestBuy and Amazon for competitive priceson gaming laptops, especially during holiday sales."
`;

async function interpretQuery(query: string): Promise<{ title: string; description: string }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: INTERPRET_QUERY_PROMPT },
      { role: 'user', content: query }
    ],
    max_tokens: 200,
    temperature: 0.3,
  });

  let response = completion.choices[0].message?.content || '{}';
  response = response.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  return JSON.parse(response);
}

async function selectRelevantTags(query: string, availableTags: string[]): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SELECT_TAGS_PROMPT },
      { role: 'user', content: `Query: ${query}\n\nAvailable tags: ${availableTags.join(', ')}` }
    ],
    max_tokens: 100,
    temperature: 0.3,
  });

  let response = completion.choices[0].message?.content || '[]';
  response = response.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  return JSON.parse(response);
}

async function generateShoppingSuggestion(description: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: GENERATE_SUGGESTION_PROMPT },
      { role: 'user', content: description }
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  return completion.choices[0].message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const userId = parseInt(session.user.id, 10);

    // Step 1: Interpret the query
    const { title, description } = await interpretQuery(query);

    // Step 2: Get user's available tags
    const userTags = await prisma.tag.findMany({
      where: { userId },
      select: { name: true }
    });

    const availableTagNames = userTags.map(tag => tag.name);

    // Step 3: Select relevant tags
    const selectedTagNames = await selectRelevantTags(query, availableTagNames);

    // Step 4: Generate shopping suggestion
    const shoppingSuggestion = await generateShoppingSuggestion(description);

    // Step 5: Create the tracker
    const tracker = await prisma.tracker.create({
      data: {
        userId,
        title,
        description,
        shoppingSuggestion,
        tags: {
          connect: selectedTagNames
            .filter(name => availableTagNames.includes(name))
            .map(name => ({ userId_name: { userId, name } }))
        }
      },
      include: {
        tags: true
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      tracker: {
        id: tracker.id,
        title: tracker.title,
        description: tracker.description,
        shoppingSuggestion: tracker.shoppingSuggestion,
        tags: tracker.tags
      }
    });

  } catch (error) {
    console.error('Error creating tracker:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to create tracker' }, { status: 500 });
  }
}