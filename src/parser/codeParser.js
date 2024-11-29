import esprima from 'esprima';
import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';

/**
 * Parse a JavaScript/TypeScript file and extract its structure
 * @param {string} filePath - Path to the file to parse
 * @returns {Promise<object>} Parsed code structure
 */
export async function parseCode(filePath) {
    try {
        // If directory, process all JS/TS files
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            return await parseDirectory(filePath);
        }

        // Parse single file
        return await parseFile(filePath);
    } catch (error) {
        throw new Error(`Failed to parse code: ${error.message}`);
    }
}

/**
 * Parse all JavaScript/TypeScript files in a directory
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<object>} Parsed code structure for all files
 */
async function parseDirectory(dirPath) {
    const files = await glob('**/*.{js,ts}', {
        cwd: dirPath,
        ignore: ['node_modules/**', '**/dist/**', '**/build/**']
    });

    const results = await Promise.all(
        files.map(file => parseFile(path.join(dirPath, file)))
    );

    return {
        type: 'directory',
        path: dirPath,
        files: results
    };
}

/**
 * Parse a single JavaScript/TypeScript file
 * @param {string} filePath - Path to the file
 * @returns {Promise<object>} Parsed code structure
 */
async function parseFile(filePath) {
    const code = await fs.readFile(filePath, 'utf-8');

    // Parse the code using esprima
    const ast = esprima.parseScript(code, {
        comment: true,
        loc: true,
        tokens: true
    });

    // Extract relevant information
    const structure = {
        type: 'file',
        path: filePath,
        name: path.basename(filePath),
        functions: extractFunctions(ast),
        classes: extractClasses(ast),
        comments: extractComments(ast),
        imports: extractImports(ast)
    };

    return structure;
}

/**
 * Extract function declarations from AST
 * @param {object} ast - Abstract Syntax Tree
 * @returns {Array} Array of function information
 */
function extractFunctions(ast) {
    const functions = [];

    traverse(ast, (node) => {
        if (node.type === 'FunctionDeclaration' ||
            node.type === 'ArrowFunctionExpression' ||
            node.type === 'FunctionExpression') {

            functions.push({
                type: node.type,
                name: node.id ? node.id.name : 'anonymous',
                params: node.params.map(param => ({
                    name: param.name,
                    type: param.typeAnnotation?.typeAnnotation?.type || 'any'
                })),
                location: node.loc,
                async: node.async || false,
                generator: node.generator || false
            });
        }
    });

    return functions;
}

/**
 * Extract class declarations from AST
 * @param {object} ast - Abstract Syntax Tree
 * @returns {Array} Array of class information
 */
function extractClasses(ast) {
    const classes = [];

    traverse(ast, (node) => {
        if (node.type === 'ClassDeclaration') {
            classes.push({
                name: node.id.name,
                methods: extractMethods(node),
                superClass: node.superClass?.name,
                location: node.loc
            });
        }
    });

    return classes;
}

/**
 * Extract methods from a class declaration
 * @param {object} classNode - Class node from AST
 * @returns {Array} Array of method information
 */
function extractMethods(classNode) {
    return classNode.body.body
        .filter(node => node.type === 'MethodDefinition')
        .map(node => ({
            name: node.key.name,
            kind: node.kind, // 'constructor', 'method', 'get', or 'set'
            static: node.static,
            params: node.value.params.map(param => ({
                name: param.name,
                type: param.typeAnnotation?.typeAnnotation?.type || 'any'
            })),
            location: node.loc
        }));
}

/**
 * Extract comments from AST
 * @param {object} ast - Abstract Syntax Tree
 * @returns {Array} Array of comment information
 */
function extractComments(ast) {
    return ast.comments.map(comment => ({
        type: comment.type, // 'Line' or 'Block'
        value: comment.value.trim(),
        location: comment.loc
    }));
}

/**
 * Extract import statements from AST
 * @param {object} ast - Abstract Syntax Tree
 * @returns {Array} Array of import information
 */
function extractImports(ast) {
    const imports = [];

    traverse(ast, (node) => {
        if (node.type === 'ImportDeclaration') {
            imports.push({
                source: node.source.value,
                specifiers: node.specifiers.map(spec => ({
                    type: spec.type,
                    name: spec.local.name,
                    imported: spec.imported?.name
                })),
                location: node.loc
            });
        }
    });

    return imports;
}

/**
 * Traverse AST nodes
 * @param {object} node - AST node
 * @param {Function} callback - Function to call for each node
 */
function traverse(node, callback) {
    callback(node);

    for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
            if (Array.isArray(node[key])) {
                node[key].forEach(child => {
                    if (child && typeof child === 'object') {
                        traverse(child, callback);
                    }
                });
            } else {
                traverse(node[key], callback);
            }
        }
    }
}