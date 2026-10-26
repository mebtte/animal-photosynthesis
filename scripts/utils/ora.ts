import ora from 'ora';
import type { Color } from 'ora';

export default {
  createSpinner: (text: string, color?: Color) => {
    const spinner = ora(text).start();
    if (color) {
      spinner.color = color;
    }
    return spinner;
  },
};
