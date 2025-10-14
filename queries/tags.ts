import { prisma } from '@/lib/db';

export async function ensureTagsExist(
  userId: number,
  requestedTags: { name: string }[]
): Promise<void> {
  if (!requestedTags || requestedTags.length === 0) {
    return;
  }

  // Fetch all existing tags for the user
  const existingTags = await prisma.tag.findMany({
    where: { userId },
    select: { name: true }
  });

  const existingTagNames = new Set(existingTags.map(tag => tag.name));

  // Identify tags that need to be created
  const tagsToCreate = requestedTags
    .filter((tag) => !existingTagNames.has(tag.name))
    .map((tag) => ({
      name: tag.name,
      userId
    }));

  // Create new tags if any
  if (tagsToCreate.length > 0) {
    await prisma.tag.createMany({
      data: tagsToCreate,
      skipDuplicates: true
    });
  }
}
