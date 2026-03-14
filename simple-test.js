// Super einfacher Test - kopiere in F12 Console
console.log('=== SIMPLE TEST ===');

// Ändere nur eine Glass Card direkt
const cards = document.querySelectorAll('.glass-card');
if (cards.length > 0) {
  cards[0].style.background = 'rgba(255, 255, 255, 0.9) !important';
  cards[0].style.border = '2px solid rgb(59, 130, 246) !important';
  console.log('✅ Erste Karte geändert zu Ocean Blue');
  console.log('Karten Hintergrund:', cards[0].style.background);
} else {
  console.log('❌ Keine Glass Cards gefunden');
}
