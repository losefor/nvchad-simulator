import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nvim-bg': '#1e222a',
        'nvim-bg-alt': '#1a1c23',
        'nvim-bg-darker': '#16181e',
        'nvim-bg-sidebar': '#181b20',
        'nvim-bg-float': '#232731',
        'nvim-bg-statusline': '#22262e',
        'nvim-bg-sel': 'rgba(97,175,239,0.15)',
        'nvim-fg': '#abb2bf',
        'nvim-fg-dim': '#5c6370',
        'nvim-fg-bright': '#d7dae0',
        'nvim-border': '#2a2e37',
        'nvim-blue': '#61afef',
        'nvim-cyan': '#56b6c2',
        'nvim-green': '#98c379',
        'nvim-yellow': '#e5c07b',
        'nvim-orange': '#d19a66',
        'nvim-red': '#e06c75',
        'nvim-purple': '#c678dd',
        'nvim-pink': '#ff75a0',
        'nvim-accent': '#7aa2f7',
        'nvim-accent-2': '#bb9af7',
      },
      fontFamily: {
        mono: '"JetBrainsMono Nerd Font", "Fira Code", "Cascadia Code", "SF Mono", Menlo, Consolas, monospace',
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        lg: '14px',
        xl: '15px',
      },
      borderRadius: {
        default: '8px',
      },
      boxShadow: {
        nvim: '0 8px 24px rgba(0,0,0,0.35)',
      },
      spacing: {
        sidebar: '260px',
        tree: '200px',
      },
      width: {
        sidebar: '260px',
        tree: '200px',
      },
      minWidth: {
        sidebar: '260px',
        tree: '200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
