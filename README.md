# auto-docs

🤖 An intelligent CLI tool that automatically generates comprehensive documentation for JavaScript/TypeScript projects using AI.

[![npm version](https://badge.fury.io/js/auto-docs.svg)](https://badge.fury.io/js/auto-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Key Features**
- 🧠 AI-Powered Documentation: Utilizes OpenAI's GPT-4 to generate intelligent and contextual documentation
- 📝 Multiple Format Support: Outputs in both Markdown and JSDoc formats
- 🔍 Smart Code Analysis: Automatically analyzes code structure, functions, classes, and relationships
- ⚡ Easy to Use: Simple CLI interface with interactive setup
- 🎨 Customizable: Flexible configuration options to match your documentation needs
- 📦 Project-Wide Support: Documents entire projects or individual files

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- OpenAI API key (you'll be prompted for this during setup)

## Quick Start

1. Install in your project:
```bash
npm install auto-docs
```

2. Initialize auto-docs (this will guide you through the setup):
```bash
npx auto-docs init
```

3. Generate documentation:
```bash
npm run docs
```

That's it! Your documentation will be generated in the specified output directory (default: `./docs`).

## Configuration

During initialization (`auto-docs init`), you'll be guided through setting up your configuration. This creates a `.autodocs.json` file with your preferences:

```json
{
  "openai": {
    "apiKey": "YOUR_OPENAI_API_KEY",
    "model": "gpt-4",
    "temperature": 0.7
  },
  "output": {
    "format": "markdown",
    "directory": "./docs",
    "createIndex": true
  },
  "parser": {
    "includePrivate": false,
    "includeTodos": true,
    "filePatterns": ["**/*.js", "**/*.ts"],
    "exclude": ["**/node_modules/**", "**/dist/**", "**/*.test.js"]
  }
}
```

### Configuration Options

#### OpenAI Settings
- `apiKey`: Your OpenAI API key
- `model`: AI model to use (default: "gpt-4")
- `temperature`: AI creativity level (0-1, default: 0.7)

#### Output Settings
- `format`: Documentation format ("markdown" or "jsdoc")
- `directory`: Output directory path
- `createIndex`: Generate index file (README.md)

#### Parser Settings
- `includePrivate`: Document private members
- `includeTodos`: Include TODO comments
- `filePatterns`: Files to process
- `exclude`: Files to ignore

## CLI Commands

### Initialize Project
```bash
npx auto-docs init
```
- Sets up configuration file
- Adds npm scripts to package.json
- Guides you through OpenAI API key setup

### Generate Documentation
```bash
# Using npm script
npm run docs

# Or directly
npx auto-docs generate
```

Options:
- `-c, --config <path>`: Custom config file path
- `-o, --output <path>`: Custom output directory

## Generated Documentation Structure

The generator creates a `docs` directory with:
- README.md (index)
- Individual markdown files for each source file
- Nested directory structure matching your project
- Complete API documentation including:
  - Function descriptions and parameters
  - Class documentation
  - Method documentation
  - Type definitions
  - Code examples
  - Dependencies and relationships

## Example Output

For a JavaScript file `calculator.js`:

```markdown
# Calculator

## Overview
A simple calculator module that provides basic mathematical operations.

## Functions

### add(a, b)
Adds two numbers together.

**Parameters:**
- `a` (*number*): First number
- `b` (*number*): Second number

**Returns:** (*number*) The sum of a and b
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check existing issues
2. Create a new issue with:
   - Your environment details
   - Steps to reproduce
   - Expected vs actual behavior

## Acknowledgments

- OpenAI for providing the GPT-4 API
- The open-source community for inspiration and tools
- Contributors who help improve this project