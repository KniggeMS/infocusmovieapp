// Theme Test - kopiere diesen Code in F12 Console
console.log('=== TESTING THEME FIX ===');

// Teste Ocean Blue direkt
const oceanTheme = {
  background: 'rgb(240, 249, 255)',
  foreground: 'rgb(12, 74, 110)',
  glassBg: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(59, 130, 246, 0.2)',
  primary: 'rgb(14, 165, 233)'
};

// Entferne alte Styles
const oldStyles = document.getElementById('test-theme-styles');
if (oldStyles) oldStyles.remove();

// Erstelle neue Styles
const styleElement = document.createElement('style');
styleElement.id = 'test-theme-styles';
styleElement.textContent = `
  body {
    background-color: ${oceanTheme.background} !important;
    color: ${oceanTheme.foreground} !important;
  }
  
  .glass-card,
  .glass-header,
  .glass-button,
  .glass-avatar,
  .glass-tag,
  .glass-input {
    background: ${oceanTheme.glassBg} !important;
    border: 1px solid ${oceanTheme.glassBorder} !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  .text-primary {
    color: ${oceanTheme.primary} !important;
  }
  
  .bg-primary {
    background-color: ${oceanTheme.primary} !important;
  }
`;

document.head.appendChild(styleElement);

console.log('✅ Ocean Blue Theme applied');
console.log('Glass BG:', oceanTheme.glassBg);
console.log('Glass Border:', oceanTheme.glassBorder);

// Prüfe ob es funktioniert
setTimeout(() => {
  const glassCards = document.querySelectorAll('.glass-card');
  if (glassCards.length > 0) {
    const firstCard = glassCards[0];
    const styles = getComputedStyle(firstCard);
    console.log('Erste Glass Card Background:', styles.backgroundColor);
    console.log('Erste Glass Card Border:', styles.borderColor);
  }
}, 100);
