// DEBUG: Kopiere diesen Code in F12 Console auf der Profil-Seite
console.log('=== THEME DEBUG ===');

// 1. Prüfe ob Theme-CSS existiert
const themeStyles = document.getElementById('theme-styles');
console.log('Theme styles gefunden:', !!themeStyles);

if (themeStyles) {
  console.log('Theme CSS Inhalt:');
  console.log(themeStyles.textContent.substring(0, 500));
}

// 2. Prüfe CSS Variablen
const rootStyles = getComputedStyle(document.documentElement);
const vars = {
  '--glass-bg': rootStyles.getPropertyValue('--glass-bg'),
  '--glass-border': rootStyles.getPropertyValue('--glass-border'),
  '--primary': rootStyles.getPropertyValue('--primary')
};

console.log('CSS Variablen:');
Object.entries(vars).forEach(([key, value]) => {
  console.log(`${key}: "${value.trim()}"`);
});

// 3. Prüfe Glass Elemente
const glassCards = document.querySelectorAll('.glass-card');
console.log('Glass cards gefunden:', glassCards.length);

if (glassCards.length > 0) {
  const firstCard = glassCards[0];
  const styles = getComputedStyle(firstCard);
  console.log('Erste Glass Card:');
  console.log('  Background:', styles.backgroundColor);
  console.log('  Border:', styles.borderColor);
  console.log('  Box-shadow:', styles.boxShadow);
}

// 4. Prüfe berechnete Styles vs CSS Variablen
const computedBg = rootStyles.getPropertyValue('--glass-bg');
console.log('Computed --glass-bg:', computedBg);
console.log('RGB Werte:', computedBg.match(/\d+/g));

console.log('=== END DEBUG ===');
