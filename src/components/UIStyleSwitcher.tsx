import React from 'react';
import { useUIStyle, UI_STYLE_LABELS, UIStyle } from '../hooks/useUIStyle';

const STYLE_PREVIEWS: Record<UIStyle, { lines: string[]; accent: string }> = {
  minimal: {
    lines: ['#e5e7eb', '#e5e7eb', '#e5e7eb'],
    accent: '#22c55e',
  },
  cinematic: {
    lines: ['#7f1d1d', '#78350f', '#713f12'],
    accent: '#e50914',
  },
  modern: {
    lines: ['#1e3a5f', '#1e3a5f', '#1e3a5f'],
    accent: '#6366f1',
  },
  editorial: {
    lines: ['#d1d5db', '#d1d5db', '#9ca3af'],
    accent: '#d97706',
  },
};

const STYLE_BG: Record<UIStyle, string> = {
  minimal:   '#ffffff',
  cinematic: '#0a0a0a',
  modern:    '#0f172a',
  editorial: '#fafaf9',
};

const STYLE_TEXT: Record<UIStyle, string> = {
  minimal:   '#111111',
  cinematic: '#e5e5e5',
  modern:    '#f1f5f9',
  editorial: '#1c1917',
};

export const UIStyleSwitcher: React.FC = () => {
  const { uiStyle, setUIStyle } = useUIStyle();

  const styles: UIStyle[] = ['minimal', 'cinematic', 'modern', 'editorial'];

  const handleSelect = (style: UIStyle) => {
    console.log('🎨 UIStyle selected:', style);
    setUIStyle(style);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '4px 0' }}>
      {styles.map((style) => {
        const label = UI_STYLE_LABELS[style];
        const preview = STYLE_PREVIEWS[style];
        const isSelected = uiStyle === style;

        return (
          <button
            key={style}
            type="button"
            onClick={() => handleSelect(style)}
            style={{
              background: 'transparent',
              border: isSelected ? `2px solid ${preview.accent}` : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: isSelected ? `0 0 0 1px ${preview.accent}40` : 'none',
              outline: 'none',
            }}
          >
            {/* Mini Preview */}
            <div
              style={{
                background: STYLE_BG[style],
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '8px',
                height: '48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              {preview.lines.map((color, i) => (
                <div
                  key={i}
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: i === 0 ? preview.accent : color,
                    width: i === 0 ? '60%' : i === 1 ? '90%' : '75%',
                  }}
                />
              ))}
            </div>

            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '14px' }}>{label.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                {label.name}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, rgba(255,255,255,0.5))' }}>
              {label.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UIStyleSwitcher;