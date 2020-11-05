import ora from 'ora';

export default {
  createSpinner: (text, color) => {
    const spinner = ora(text).start();
    if (color) {
      spinner.color = color;
    }
    return spinner;
  },
};
