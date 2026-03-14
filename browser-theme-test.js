// Browser Theme Test - Copy this into browser console (F12)
console.log('=== BROWSER THEME DEBUG ===');

// Test 1: Check if theme functions are available
if (typeof window !== 'undefined' && window.applyTheme) {
  console.log('✅ applyTheme function available');
} else {
  console.log('❌ applyTheme function NOT available');
}

// Test 2: Check current CSS variables
const rootStyles = getComputedStyle(document.documentElement);
const currentVars = {
  '--background': rootStyles.getPropertyValue('--background'),
  '--foreground': rootStyles.getPropertyValue('--foreground'),
  '--primary': rootStyles.getPropertyValue('--primary'),
  '--card': rootStyles.getPropertyValue('--card'),
  '--glass-bg': rootStyles.getPropertyValue('--glass-bg'),
  '--glass-border': rootStyles.getPropertyValue('--glass-border')
};

console.log('Current CSS Variables:');
Object.entries(currentVars).forEach(([key, value]) => {
  console.log(`${key}: "${value.trim()}"`);
});

// Test 3: Check body data-theme attribute
const bodyTheme = document.body.getAttribute('data-theme');
console.log('Body data-theme:', bodyTheme);

// Test 4: Check if theme styles exist
const themeStyles = document.getElementById('theme-styles');
if (themeStyles) {
  console.log('✅ Theme styles found');
  console.log('Theme CSS length:', themeStyles.textContent.length);
  console.log('First 200 chars:', themeStyles.textContent.substring(0, 200));
} else {
  console.log('❌ No theme styles found');
}

// Test 5: Check glass elements
const glassElements = document.querySelectorAll('[class*="glass"]');
console.log('Glass elements found:', glassElements.length);

// Test first glass element styles
if (glassElements.length > 0) {
  const firstGlass = glassElements[0];
  const glassStyles = getComputedStyle(firstGlass);
  console.log('First glass element background:', glassStyles.backgroundColor);
  console.log('First glass element border:', glassStyles.border);
}

console.log('=== END BROWSER THEME DEBUG ===');
