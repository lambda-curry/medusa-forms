import type { Preview } from '@storybook/react-vite';
import '../src/main.css';
import theme from './theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme,
    },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
};

export default preview;

