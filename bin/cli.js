#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { initializeProject } from '../src/commands/init.js';
import { generateDocs } from '../src/commands/generate.js';
import { version } from '../package.json';

program
  .version(version)
  .description('AI-powered documentation generator for JavaScript/TypeScript projects');

program
  .command('init')
  .description('Initialize auto-docs in your project')
  .action(async () => {
    try {
      await initializeProject();
      console.log(chalk.green('✨ auto-docs initialized successfully!'));
    } catch (error) {
      console.error(chalk.red('Error initializing auto-docs:'), error.message);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate documentation for your project')
  .option('-c, --config <path>', 'Path to config file', '.autodocs.json')
  .option('-o, --output <path>', 'Output directory', 'docs')
  .action(async (options) => {
    try {
      await generateDocs(options);
      console.log(chalk.green('📚 Documentation generated successfully!'));
    } catch (error) {
      console.error(chalk.red('Error generating documentation:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);