import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseCode } from '../parser/codeParser.js';
import { generateDocumentation } from '../ai/openaiProcessor.js';
import { saveDocumentation } from '../utils/fileHandler.js';

export async function generateDocs(options) {
  const spinner = ora('Loading configuration...').start();

  try {
    // Load configuration
    const configPath = path.resolve(process.cwd(), options.config);
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

    // Validate OpenAI API key
    if (!config.openai.apiKey || config.openai.apiKey === 'YOUR_OPENAI_API_KEY') {
      spinner.fail('OpenAI API key not configured');
      throw new Error('Please run "npm run docs:init" to configure your API key');
    }

    // Set up environment
    process.env.OPENAI_API_KEY = config.openai.apiKey;

    // Parse code
    spinner.text = 'Parsing source code...';
    const parsedCode = await parseCode(process.cwd(), config.parser);

    // Generate documentation
    spinner.text = 'Generating documentation...';
    const documentation = await generateDocumentation(parsedCode, config.openai);

    // Save documentation
    spinner.text = 'Saving documentation...';
    const outputPath = options.output || config.output.directory;
    await saveDocumentation(documentation, outputPath, config.output);

    spinner.succeed('Documentation generated successfully!');
    console.log(chalk.blue('\nDocumentation saved to:'), chalk.cyan(outputPath));
  } catch (error) {
    spinner.fail('Documentation generation failed');
    throw error;
  }
}