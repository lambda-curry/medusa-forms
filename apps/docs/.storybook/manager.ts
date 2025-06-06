import { addons } from 'storybook/internal/manager-api';
import { create } from 'storybook/internal/theming';
import lambdaCurryLogo from '../src/assets/lambda-curry-logo.png';
import './storybook-theme.css';

const theme = create({
  base: 'light',

  // Brand
  brandTitle: 'Lambda Curry | Medusa Forms',
  brandUrl: 'https://lambdacurry.com',
  brandImage: lambdaCurryLogo,
  brandTarget: '_self',

  // Colors
  colorPrimary: '#FF6B35', // Lambda Curry orange
  colorSecondary: '#2D3748', // Dark gray

  // UI
  appBg: '#FFFFFF',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#E2E8F0',
  appBorderRadius: 8,

  // Text colors
  textColor: '#2D3748',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#718096',

  // Toolbar default and active colors
  barTextColor: '#718096',
  barSelectedColor: '#FF6B35',
  barHoverColor: '#FF6B35',
  barBg: '#FFFFFF',

  // Form colors
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputTextColor: '#2D3748',
  inputBorderRadius: 6,

  // Fonts
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontCode: '"Fira Code", "Consolas", "Monaco", monospace',
});

addons.setConfig({
  theme,
  panelPosition: 'bottom',
  selectedPanel: 'controls',
  sidebar: {
    showRoots: false,
    collapsedRoots: ['other'],
  },
});
