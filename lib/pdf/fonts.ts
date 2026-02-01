import { Font } from '@react-pdf/renderer';

// Register Roboto font family from Google Fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xP.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBhc9.ttf',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5vAw.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 500,
    },
  ],
});

// Register Roboto Mono for code blocks
Font.register({
  family: 'Roboto Mono',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/robotomono/v23/L0x5DF4xlVMF-BfR8bXMIjhLq38.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/robotomono/v23/L0x5DF4xlVMF-BfR8bXMIjhOq3-cXg.ttf',
      fontWeight: 700,
    },
  ],
});

// Disable hyphenation to prevent text breaking issues
Font.registerHyphenationCallback((word) => [word]);

export const DEFAULT_FONT_FAMILY = 'Roboto';
export const MONOSPACE_FONT_FAMILY = 'Roboto Mono';
