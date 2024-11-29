import { parseCode } from './parser/codeParser.js';
import { generateDocumentation } from './ai/openaiProcessor.js';
import { saveDocumentation } from './utils/fileHandler.js';
import { loadConfig } from './utils/config.js';

/**
 * Main function to generate documentation for a given project or file
 * @param {string} inputPath - Path to the project or file
 * @param {string} outputPath - Path where documentation should be saved
 * @returns {Promise<object>} Generated documentation
 */
export async function generateDocs(inputPath, outputPath) {
    try {
        // 1. Load configuration
        const config = await loadConfig();

        // 2. Parse the code
        const parsedCode = await parseCode(inputPath);

        // 3. Generate documentation using AI
        const documentation = await generateDocumentation(parsedCode);

        // 4. Save the documentation
        await saveDocumentation(documentation, outputPath || './docs');

        return documentation;
    } catch (error) {
        console.error('Error generating documentation:', error);
        throw error;
    }
}

// Export additional utilities that might be useful for programmatic usage
export { parseCode } from './parser/codeParser.js';
export { generateDocumentation } from './ai/openaiProcessor.js';