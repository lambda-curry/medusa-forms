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
          ['Welcome', 'Getting Started'],
          'Components',
          'Examples',
          '*'
        ],
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
  },
};

export default preview;
