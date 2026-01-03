import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme System Foundation', () => {
  it('should have themes.css with core variables defined', () => {
    const cssPath = path.resolve(__dirname, '../../src/styles/themes.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    // Check for core variables
    expect(content).toContain('--bg-primary:');
    expect(content).toContain('--text-main:');
    
    // Check for theme selectors
    expect(content).toContain(':root[data-theme="light"]');
    expect(content).toContain(':root[data-theme="dark"]');
    expect(content).toContain(':root[data-theme="glass"]');
  });

  it('should have tailwind config mapping semantic colors', () => {
    const configPath = path.resolve(__dirname, '../../tailwind.config.js');
    const content = fs.readFileSync(configPath, 'utf-8');

    // Check if mappings exist
    expect(content).toContain("'app-bg': 'var(--bg-primary)'");
    expect(content).toContain("'app-text': 'var(--text-main)'");
  });

  it('should index.css importing themes', () => {
     const indexPath = path.resolve(__dirname, '../../src/index.css');
     const content = fs.readFileSync(indexPath, 'utf-8');
     
     expect(content).toContain("@import './styles/themes.css';");
     expect(content).toContain("@apply bg-app-bg text-app-text");
  });
});
