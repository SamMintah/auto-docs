# AI Documentation Generator

🤖 An intelligent documentation generator that uses AI to automatically create comprehensive documentation for JavaScript/TypeScript projects.

## Features

✨ **Key Features**
- 🧠 AI-Powered Documentation: Utilizes OpenAI's GPT-4 to generate intelligent and contextual documentation
- 📝 Multiple Format Support: Outputs in both Markdown and JSDoc formats
- 🔍 Smart Code Analysis: Automatically analyzes code structure, functions, classes, and relationships
- ⚡ Easy to Use: Simple CLI interface for quick documentation generation
- 🎨 Customizable: Flexible configuration options to match your documentation needs
- 📦 Project-Wide Support: Documents entire projects or individual files

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd documentation-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your-api-key-here
```

4. Make the CLI executable:
```bash
chmod +x bin/generate-docs.js
```

## Usage

### Basic Usage

Generate documentation for a project or file:
```bash
./bin/generate-docs.js -p ./path/to/your/project
```

### Command Options

- `-p, --path <path>`: Path to the project or file (required)
- `-o, --output <path>`: Custom output directory (default: ./docs)
- `-f, --format <format>`: Output format (markdown/jsdoc) (default: markdown)

### Configuration

Create a `.docgenrc.json` file in your project root to customize the behavior:

```json
{
  "output": {
    "format": "markdown",
    "directory": "./docs",
    "createIndex": true,
    "prettier": true
  },
  "parser": {
    "includePrivate": false,
    "includeTodos": true,
    "parseComments": true,
    "filePatterns": ["**/*.js", "**/*.ts"],
    "exclude": ["**/node_modules/**", "**/dist/**"]
  },
  "documentation": {
    "includeExamples": true,
    "includeTypes": true,
    "groupByModule": true
  }
}
```

## Project Structure

```
documentation-generator/
├── bin/
│   └── generate-docs.js      # CLI entry point
├── src/
│   ├── index.js             # Main entry point
│   ├── parser/              # Code parsing
│   │   └── codeParser.js
│   ├── ai/                  # AI processing
│   │   └── openaiProcessor.js
│   └── utils/               # Utilities
│       ├── config.js        # Configuration management
│       └── fileHandler.js   # File operations
└── tests/                   # Test files
```

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

## Classes

### Calculator
Main calculator class implementation.

#### Methods
##### multiply(a, b)
Multiplies two numbers.

**Parameters:**
- `a` (*number*): First number
- `b` (*number*): Second number

**Returns:** (*number*) The product of a and b
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