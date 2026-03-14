const puppeteer = require('puppeteer');
const fs = require('fs');

async function takeScreenshot(url, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  await page.screenshot({ 
    path: outputPath, 
    fullPage: true,
    type: 'png'
  });
  
  await browser.close();
  console.log(`Screenshot saved: ${outputPath}`);
}

// Usage
const url = process.argv[2] || 'http://localhost:3000/search';
const filename = process.argv[3] || 'search-page.png';

takeScreenshot(url, `./screenshots/${filename}`).catch(console.error);
