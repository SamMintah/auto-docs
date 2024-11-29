import OpenAI from 'openai';
import chalk from 'chalk';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate documentation for parsed code structure
 * @param {object} codeStructure - Parsed code structure from codeParser
 * @returns {Promise<object>} Generated documentation
 */
export async function generateDocumentation(codeStructure) {
    if (codeStructure.type === 'directory') {
        return await generateDirectoryDocs(codeStructure);
    }
    return await generateFileDocs(codeStructure);
}

/**
 * Generate documentation for a directory of files
 * @param {object} directoryStructure - Parsed directory structure
 * @returns {Promise<object>} Generated documentation for directory
 */
async function generateDirectoryDocs(directoryStructure) {
    console.log(chalk.blue(`📂 Processing directory: ${directoryStructure.path}`));

    const filesDocs = await Promise.all(
        directoryStructure.files.map(file => generateFileDocs(file))
    );

    return {
        type: 'directory',
        path: directoryStructure.path,
        files: filesDocs
    };
}

/**
 * Generate documentation for a single file
 * @param {object} fileStructure - Parsed file structure
 * @returns {Promise<object>} Generated documentation for file
 */
async function generateFileDocs(fileStructure) {
    console.log(chalk.blue(`📄 Processing file: ${fileStructure.name}`));

    const docs = {
        type: 'file',
        path: fileStructure.path,
        name: fileStructure.name,
        overview: await generateFileOverview(fileStructure),
        functions: await generateFunctionsDocs(fileStructure.functions),
        classes: await generateClassesDocs(fileStructure.classes)
    };

    return docs;
}

/**
 * Generate an overview of the file
 * @param {object} fileStructure - Parsed file structure
 * @returns {Promise<string>} Generated overview
 */
async function generateFileOverview(fileStructure) {
    const prompt = createFileOverviewPrompt(fileStructure);

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "You are a technical documentation expert. Generate clear, concise, and accurate documentation for the code."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 500
    });

    return response.choices[0].message.content.trim();
}

/**
 * Generate documentation for functions
 * @param {Array} functions - Array of parsed functions
 * @returns {Promise<Array>} Generated documentation for functions
 */
async function generateFunctionsDocs(functions) {
    if (!functions || functions.length === 0) return [];

    const docs = await Promise.all(
        functions.map(async (func) => {
            const prompt = createFunctionPrompt(func);

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Generate clear and accurate JSDoc-style documentation for this function."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 350
            });

            return {
                ...func,
                documentation: response.choices[0].message.content.trim()
            };
        })
    );

    return docs;
}

/**
 * Generate documentation for classes
 * @param {Array} classes - Array of parsed classes
 * @returns {Promise<Array>} Generated documentation for classes
 */
async function generateClassesDocs(classes) {
    if (!classes || classes.length === 0) return [];

    const docs = await Promise.all(
        classes.map(async (cls) => {
            const prompt = createClassPrompt(cls);

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Generate clear and accurate JSDoc-style documentation for this class."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            // Generate docs for methods
            const methodDocs = await Promise.all(
                cls.methods.map(method => generateMethodDocs(method))
            );

            return {
                ...cls,
                documentation: response.choices[0].message.content.trim(),
                methods: methodDocs
            };
        })
    );

    return docs;
}

/**
 * Generate documentation for a class method
 * @param {object} method - Parsed method structure
 * @returns {Promise<object>} Generated documentation for method
 */
async function generateMethodDocs(method) {
    const prompt = createMethodPrompt(method);

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "Generate clear and accurate JSDoc-style documentation for this method."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 350
    });

    return {
        ...method,
        documentation: response.choices[0].message.content.trim()
    };
}

/**
 * Create a prompt for file overview generation
 * @param {object} fileStructure - Parsed file structure
 * @returns {string} Generated prompt
 */
function createFileOverviewPrompt(fileStructure) {
    return `Please provide a clear and concise overview of this JavaScript/TypeScript file:

File: ${fileStructure.name}
Imports: ${JSON.stringify(fileStructure.imports, null, 2)}
Number of Functions: ${fileStructure.functions.length}
Number of Classes: ${fileStructure.classes.length}

Please include:
1. The main purpose of this file
2. Key components and their relationships
3. Any important dependencies
4. Usage examples if applicable

Format the response in markdown.`;
}

/**
 * Create a prompt for function documentation generation
 * @param {object} func - Parsed function structure
 * @returns {string} Generated prompt
 */
function createFunctionPrompt(func) {
    return `Please generate JSDoc documentation for this JavaScript/TypeScript function:

Name: ${func.name}
Type: ${func.type}
Parameters: ${JSON.stringify(func.params, null, 2)}
Async: ${func.async}
Generator: ${func.generator}

Include:
1. Function description
2. Parameter descriptions with types
3. Return value description
4. Example usage
5. Any throws/exceptions if applicable

Format the response in JSDoc style.`;
}

/**
 * Create a prompt for class documentation generation
 * @param {object} cls - Parsed class structure
 * @returns {string} Generated prompt
 */
function createClassPrompt(cls) {
    return `Please generate JSDoc documentation for this JavaScript/TypeScript class:

Name: ${cls.name}
Extends: ${cls.superClass || 'none'}
Number of Methods: ${cls.methods.length}

Include:
1. Class description
2. Constructor parameters if any
3. Important methods overview
4. Example usage
5. Any important notes or warnings

Format the response in JSDoc style.`;
}

/**
 * Create a prompt for method documentation generation
 * @param {object} method - Parsed method structure
 * @returns {string} Generated prompt
 */
function createMethodPrompt(method) {
    return `Please generate JSDoc documentation for this class method:

Name: ${method.name}
Kind: ${method.kind}
Static: ${method.static}
Parameters: ${JSON.stringify(method.params, null, 2)}

Include:
1. Method description
2. Parameter descriptions with types
3. Return value description
4. Example usage
5. Any throws/exceptions if applicable

Format the response in JSDoc style.`;
}