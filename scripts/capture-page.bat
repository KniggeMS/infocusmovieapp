@echo off
echo Taking screenshot of search page...
node scripts/take-screenshot.js http://localhost:3001/search search-page.png
echo Screenshot saved to screenshots/search-page.png
pause
