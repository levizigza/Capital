const fs = require('fs');

/** @type {import('tailwindcss').Config} */

let theme = {};
try {
  const themePath = './theme.json';
  if (fs.existsSync(themePath)) {
    theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
  }
} catch (err) {
  // safe fallback — log and continue with defaults
  // console.error('failed to parse custom styles', err);
}

const defaultTheme = {
  container: { center: true, padding: '2rem' },
  extend: {},
};

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { ...defaultTheme, ...theme },
};
