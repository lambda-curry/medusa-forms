import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';
import lambdaCurryLogo from '../src/assets/lambda-curry-logo.png';

const theme = create({
  base: 'light',
  
  // Minimal brand customization - just logo and title
  brandTitle: 'Lambda Curry | Medusa Forms',
  brandUrl: 'https://lambdacurry.dev',
  brandImage: lambdaCurryLogo,
  brandTarget: '_self',

  // Keep default Storybook colors for UI
  colorPrimary: '#FF6B35', // Only use Lambda Curry orange for primary actions
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
