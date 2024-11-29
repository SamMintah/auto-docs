import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Save generated documentation to files
 * @param {object} documentation - Generated documentation object
 * @param {string} outputPath - Path where documentation should be saved
 * @returns {Promise<void>}
 */
export async function saveDocumentation(documentation, outputPath) {
    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(outputPath, { recursive: true });

        if (documentation.type === 'directory') {
            await saveDirectoryDocs(documentation, outputPath);
        } else {
            await saveFileDocs(documentation, outputPath);
        }

        // Generate index file
        await generateIndexFile(documentation, outputPath);
    } catch (error) {
        throw new Error(`Failed to save documentation: ${error.message}`);
    }
}

/**
 * Save documentation for a directory
 * @param {object} documentation - Directory documentation object
 * @param {string} outputPath - Base output path
 * @returns {Promise<void>}
 */
async function saveDirectoryDocs(documentation, outputPath) {
    console.log(chalk.blue(`📁 Saving documentation for directory: ${documentation.path}`));

    // Create subdirectory for the current directory's docs
    const dirName = path.basename(documentation.path);
    const dirOutputPath = path.join(outputPath, dirName);
    await fs.mkdir(dirOutputPath, { recursive: true });

    // Save documentation for each file
    await Promise.all(
        documentation.files.map(fileDoc => saveFileDocs(fileDoc, dirOutputPath))
    );
}

/**
 * Save documentation for a single file
 * @param {object} documentation - File documentation object
 * @param {string} outputPath - Output directory path
 * @returns {Promise<void>}
 */
async function saveFileDocs(documentation, outputPath) {
    console.log(chalk.blue(`📄 Saving documentation for file: ${documentation.name}`));

    const fileName = `${path.basename(documentation.name, path.extname(documentation.name))}.md`;
    const filePath = path.join(outputPath, fileName);

    const content = generateMarkdownContent(documentation);
    await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Generate index file for the documentation
 * @param {object} documentation - Root documentation object
 * @param {string} outputPath - Output directory path
 * @returns {Promise<void>}
 */
async function generateIndexFile(documentation, outputPath) {
    console.log(chalk.blue('📑 Generating documentation index...'));

    const indexContent = generateIndexContent(documentation);
    await fs.writeFile(path.join(outputPath, 'README.md'), indexContent, 'utf-8');
}

/**
 * Generate markdown content for a file's documentation
 * @param {object} documentation - File documentation object
 * @returns {string} Markdown content
 */
function generateMarkdownContent(documentation) {
    let content = [];

    // Add header
    content.push(`# ${documentation.name}`);
    content.push('');

    // Add overview
    content.push('## Overview');
    content.push(documentation.overview);
    content.push('');

    // Add functions
    if (documentation.functions.length > 0) {
        content.push('## Functions');
        content.push('');

        documentation.functions.forEach(func => {
            content.push(`### ${func.name}`);
            content.push('');
            content.push(func.documentation);
            content.push('');
        });
    }

    // Add classes
    if (documentation.classes.length > 0) {
        content.push('## Classes');
        content.push('');

        documentation.classes.forEach(cls => {
            content.push(`### ${cls.name}`);
            content.push('');
            content.push(cls.documentation);
            content.push('');

            // Add methods
            if (cls.methods.length > 0) {
                content.push('#### Methods');
                content.push('');

                cls.methods.forEach(method => {
                    content.push(`##### ${method.name}`);
                    content.push('');
                    content.push(method.documentation);
                    content.push('');
                });
            }
        });
    }

    return content.join('\n');
}

/**
 * Generate index content for documentation
 * @param {object} documentation - Root documentation object
 * @returns {string} Markdown content for index
 */
function generateIndexContent(documentation) {
    let content = [];

    // Add header
    content.push('# API Documentation');
    content.push('');

    // Add introduction
    content.push('## Introduction');
    content.push('This documentation is automatically generated using AI-powered analysis of the source code.');
    content.push('');

    // Add table of contents
    content.push('## Table of Contents');
    content.push('');

    function addToToc(doc, level = 0) {
        const indent = '  '.repeat(level);

        if (doc.type === 'directory') {
            content.push(`${indent}- 📁 ${path.basename(doc.path)}/`);
            doc.files.forEach(file => addToToc(file, level + 1));
        } else {
            const fileName = path.basename(doc.name, path.extname(doc.name));
            const link = `./${fileName}.md`;
            content.push(`${indent}- 📄 [${fileName}](${link})`);
        }
    }

    addToToc(documentation);

    return content.join('\n');
}

/**
 * Format JSDoc comment as markdown
 * @param {string} jsdoc - JSDoc comment
 * @returns {string} Markdown formatted documentation
 */
function formatJSDocToMarkdown(jsdoc) {
    return jsdoc
        .replace(/\{@link ([^}]+)\}/g, '`$1`')
        .replace(/@param \{([^}]+)\} ([^ ]+) /g, '- `$2` (*$1*): ')
        .replace(/@returns? \{([^}]+)\}/g, '**Returns:** (*$1*)');
}