/**
 * A set of 10 vibrant colors for tags
 */
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

/**
 * Simple hash function for strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Assigns a color to a tag name based on its hash
 * The same tag name will always get the same color
 */
export function getTagColor(tagName: string): string {
  const hash = hashString(tagName);
  const colorIndex = hash % TAG_COLORS.length;
  return TAG_COLORS[colorIndex];
}

/**
 * Export the color array for reference
 */
export { TAG_COLORS };