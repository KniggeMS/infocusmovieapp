/**
 * Generates a privacy-friendly avatar URL using the DiceBear API.
 * Style: "bottts" (Robots) fits the tech/modern theme of InFocus.
 * 
 * @param seed - A string to seed the generator (e.g. username, email, or random string)
 * @returns string - The URL to the SVG avatar
 */
export function generateAvatarUrl(seed: string): string {
  // Use a reliable, public CDN for DiceBear
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}
