// Einfaches Theme System - garantiert funktionierend
export const simpleThemes = {
  'apple-frosted-light': {
    background: 'rgb(242, 242, 247)',
    foreground: 'rgb(28, 28, 30)',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.18)',
    primary: 'rgb(0, 122, 255)'
  },
  'apple-frosted-dark': {
    background: 'rgb(0, 0, 0)',
    foreground: 'rgb(255, 255, 255)',
    glassBg: 'rgba(44, 44, 46, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    primary: 'rgb(10, 132, 255)'
  },
  'ocean-blue': {
    background: 'rgb(240, 249, 255)',
    foreground: 'rgb(12, 74, 110)',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(59, 130, 246, 0.2)',
    primary: 'rgb(14, 165, 233)'
  },
  'forest-green': {
    background: 'rgb(240, 253, 244)',
    foreground: 'rgb(20, 83, 45)',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(34, 197, 94, 0.2)',
    primary: 'rgb(34, 197, 94)'
  },
  'cinema-noir': {
    background: 'rgb(10, 10, 10)',
    foreground: 'rgb(232, 232, 232)',
    glassBg: 'rgba(20, 20, 20, 0.85)',
    glassBorder: 'rgba(255, 215, 0, 0.15)',
    primary: 'rgb(255, 215, 0)'
  },
  'sunset-purple': {
    background: 'rgb(26, 0, 26)',
    foreground: 'rgb(243, 232, 255)',
    glassBg: 'rgba(45, 27, 45, 0.85)',
    glassBorder: 'rgba(167, 139, 250, 0.2)',
    primary: 'rgb(167, 139, 250)'
  }
}

export function applySimpleTheme(themeId: string) {
  const theme = simpleThemes[themeId as keyof typeof simpleThemes];
  if (!theme) return;

  // Entferne alte Styles
  const oldStyles = document.getElementById('simple-theme-styles');
  if (oldStyles) oldStyles.remove();

  // Erstelle neue Styles mit direkten Farben
  const styleElement = document.createElement('style');
  styleElement.id = 'simple-theme-styles';
  styleElement.textContent = `
    body {
      background-color: ${theme.background} !important;
      color: ${theme.foreground} !important;
    }
    
    .glass-card,
    .glass-header,
    .glass-button,
    .glass-avatar,
    .glass-tag,
    .glass-input {
      background: ${theme.glassBg} !important;
      border: 1px solid ${theme.glassBorder} !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .text-primary {
      color: ${theme.primary} !important;
    }
    
    .bg-primary {
      background-color: ${theme.primary} !important;
    }
  `;
  
  document.head.appendChild(styleElement);
  document.body.setAttribute('data-theme', themeId);
  
  console.log(`✅ Simple Theme "${themeId}" applied`);
  console.log(`Glass BG: ${theme.glassBg}`);
}
