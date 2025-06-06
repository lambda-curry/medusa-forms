import type { Preview } from '@storybook/react-vite';
import '../src/main.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          ['Welcome', 'Getting Started', 'Installation'],
          'Components',
          ['Form Controls', '*'],
          'Examples',
          '*'
        ],
      },
    },
    docs: {
      theme: {
        base: 'light',
        brandTitle: 'Lambda Curry | Medusa Forms',
        brandUrl: 'https://lambdacurry.com',
        colorPrimary: '#FF6B35',
        colorSecondary: '#2D3748',
        appBg: '#FFFFFF',
        appContentBg: '#FFFFFF',
        textColor: '#2D3748',
        fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'gray',
          value: '#F7FAFC',
        },
        {
          name: 'dark',
          value: '#2D3748',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
