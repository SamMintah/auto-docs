#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { generateDocs } from '../src/index.js';

// Load environment variables
dotenv.config();

// Verify OpenAI API key
if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('Error: OPENAI_API_KEY is not set in your environment'));
    console.log(chalk.yellow('Please add your OpenAI API key to the .env file'));
    process.exit(1);
}

program
    .version('1.0.0')
    .description('AI-powered documentation generator')
    .requiredOption('-p, --path <path>', 'Path to project or file')
    .option('-o, --output <output>', 'Output path for documentation', './docs')
    .option('-f, --format <format>', 'Documentation format (markdown/jsdoc)', 'markdown')
    .parse(process.argv);

const options = program.opts();

console.log(chalk.blue('Starting documentation generation...'));

generateDocs(options.path, options.output)
    .then(() => {
        console.log(chalk.green('✨ Documentation generated successfully!'));
        console.log(chalk.blue(`📚 Documentation saved to: ${options.output}`));
    })
    .catch((error) => {
        console.error(chalk.red('Error generating documentation:'));
        console.error(chalk.red(error.message));
        process.exit(1);
    });