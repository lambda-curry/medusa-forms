import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  
  // Brand
  brandTitle: 'Medusa Forms by Lambda Curry',
  brandUrl: 'https://lambdacurry.dev',
  brandImage: 'https://lambdacurry.dev/favicon.ico',
  brandTarget: '_blank',

  // Colors
  colorPrimary: '#6366f1', // Lambda Curry brand color
  colorSecondary: '#6366f1',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e2e8f0',
  appBorderRadius: 8,

  // Text colors
  textColor: '#1f2937',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#6b7280',
  barSelectedColor: '#6366f1',
  barBg: '#f8fafc',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#1f2937',
  inputBorderRadius: 6,
});

