import inquirer from 'inquirer';
import fs from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';

const CONFIG_FILENAME = '.autodocs.json';

const defaultConfig = {
  openai: {
    apiKey: "YOUR_OPENAI_API_KEY",
    model: "gpt-4",
    temperature: 0.7
  },
  output: {
    format: "markdown",
    directory: "./docs",
    createIndex: true
  },
  parser: {
    includePrivate: false,
    includeTodos: true,
    filePatterns: ["**/*.js", "**/*.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.test.js"]
  }
};

export async function initializeProject() {
  const spinner = ora('Initializing auto-docs...').start();

  try {
    // Check if config already exists
    try {
      await fs.access(CONFIG_FILENAME);
      spinner.stop();
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Configuration file already exists. Overwrite?',
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
    } catch (error) {
      // File doesn't exist, continue
    }

    // Get user input
    spinner.stop();
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your OpenAI API key:',
        validate: input => input.trim().length > 0 || 'API key is required'
      },
      {
        type: 'list',
        name: 'format',
        message: 'Select documentation format:',
        choices: ['markdown', 'jsdoc'],
        default: 'markdown'
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Enter documentation output directory:',
        default: './docs'
      },
      {
        type: 'confirm',
        name: 'includePrivate',
        message: 'Include private members in documentation?',
        default: false
      }
    ]);

    // Create configuration
    const config = {
      ...defaultConfig,
      openai: {
        ...defaultConfig.openai,
        apiKey: answers.apiKey
      },
      output: {
        ...defaultConfig.output,
        format: answers.format,
        directory: answers.outputDir
      },
      parser: {
        ...defaultConfig.parser,
        includePrivate: answers.includePrivate
      }
    };

    // Save configuration
    spinner.text = 'Saving configuration...';
    spinner.start();
    await fs.writeFile(CONFIG_FILENAME, JSON.stringify(config, null, 2));

    // Add .autodocs.json to .gitignore
    try {
      const gitignorePath = '.gitignore';
      let gitignoreContent = '';
      try {
        gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      } catch (error) {
        // .gitignore doesn't exist
      }

      if (!gitignoreContent.includes(CONFIG_FILENAME)) {
        await fs.appendFile(gitignorePath, `\n${CONFIG_FILENAME}\n`);
      }
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not update .gitignore'));
    }

    spinner.succeed('Configuration saved successfully!');

    // Add npm scripts
    spinner.text = 'Updating package.json...';
    spinner.start();
    
    try {
      const packageJsonPath = 'package.json';
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      packageJson.scripts = {
        ...packageJson.scripts,
        docs: 'auto-docs generate',
        'docs:init': 'auto-docs init'
      };

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      spinner.succeed('Package.json updated successfully!');
    } catch (error) {
      spinner.warn('Could not update package.json');
    }

    console.log(chalk.green('\n✨ auto-docs initialized successfully!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Review the configuration in', chalk.cyan(CONFIG_FILENAME));
    console.log('2. Generate documentation using:', chalk.cyan('npm run docs'));
  } catch (error) {
    spinner.fail('Initialization failed');
    throw error;
  }
}