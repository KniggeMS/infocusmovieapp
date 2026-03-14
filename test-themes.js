// Theme Debug Test
const { applyTheme, getTheme, themes } = require('./lib/themes.ts');

console.log('=== THEME DEBUG TEST ===');

// Test 1: Check if themes are loaded
console.log('Available themes:', themes.map(t => t.id));

// Test 2: Apply Apple Frosted Glass Light
const appleTheme = getTheme('apple-frosted-light');
if (appleTheme) {
  console.log('✅ Apple Frosted Light theme found');
  console.log('Primary color:', appleTheme.colors.primary);
  console.log('Glass background:', appleTheme.colors.glassBackground);
  
  // Apply theme
  applyTheme(appleTheme);
  console.log('✅ Apple Frosted Light theme applied');
}

// Test 3: Check CSS variables
if (typeof document !== 'undefined') {
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary');
  const glassBg = rootStyles.getPropertyValue('--glass-bg');
  
  console.log('CSS Variables after applying theme:');
  console.log('--primary:', primaryColor);
  console.log('--glass-bg:', glassBg);
} else {
  console.log('❌ Document not available (server-side)');
}

// Test 4: Check problematic themes
const oceanTheme = getTheme('ocean-blue');
const forestTheme = getTheme('forest-green');

console.log('Ocean Blue theme:');
console.log('  Card background:', oceanTheme?.colors.card);
console.log('  Glass background:', oceanTheme?.colors.glassBackground);

console.log('Forest Green theme:');
console.log('  Card background:', forestTheme?.colors.card);
console.log('  Glass background:', forestTheme?.colors.glassBackground);

console.log('=== END THEME DEBUG ===');
