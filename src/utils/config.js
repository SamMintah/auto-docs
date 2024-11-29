import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';

// Default configuration
const DEFAULT_CONFIG = {
    // Output settings
    output: {
        format: 'markdown',
        directory: './docs',
        createIndex: true,
        prettier: true
    },

    // Parser settings
    parser: {
        includePrivate: false,
        includeTodos: true,
        parseComments: true,
        filePatterns: ['**/*.js', '**/*.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.js', '**/*.spec.js']
    },

    // AI settings
    ai: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: {
            overview: 500,
            function: 350,
            class: 500,
            method: 350
        },
        style: 'professional'
    },

    // Documentation settings
    documentation: {
        includeExamples: true,
        includeTypes: true,
        includeDescription: true,
        includeTags: ['param', 'returns', 'throws', 'example', 'deprecated'],
        groupByModule: true
    }
};

/**
 * Load and validate configuration
 * @returns {Promise<object>} Merged configuration
 */
export async function loadConfig() {
    try {
        // Look for config file in current directory
        const configFiles = [
            '.docgenrc',
            '.docgenrc.json',
            '.docgenrc.yaml',
            '.docgenrc.yml',
            'docgen.config.js'
        ];

        let userConfig = {};

        // Try to load user configuration
        for (const configFile of configFiles) {
            try {
                const configPath = path.resolve(process.cwd(), configFile);
                const stats = await fs.stat(configPath);

                if (stats.isFile()) {
                    console.log(chalk.blue(`📝 Loading configuration from ${configFile}`));

                    if (configFile.endsWith('.js')) {
                        userConfig = (await import(configPath)).default;
                    } else if (configFile.endsWith('.json')) {
                        const content = await fs.readFile(configPath, 'utf-8');
                        userConfig = JSON.parse(content);
                    } else if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
                        const content = await fs.readFile(configPath, 'utf-8');
                        userConfig = yaml.load(content);
                    } else {
                        const content = await fs.readFile(configPath, 'utf-8');
                        try {
                            userConfig = JSON.parse(content);
                        } catch {
                            userConfig = yaml.load(content);
                        }
                    }

                    break;
                }
            } catch (error) {
                // Config file doesn't exist or can't be read, continue to next one
                continue;
            }
        }

        // Merge with default configuration
        const config = mergeConfigs(DEFAULT_CONFIG, userConfig);

        // Validate configuration
        validateConfig(config);

        return config;
    } catch (error) {
        console.warn(chalk.yellow('⚠️  Error loading configuration, using defaults'));
        console.error(chalk.red(error.message));
        return DEFAULT_CONFIG;
    }
}

/**
 * Merge default and user configurations
 * @param {object} defaultConfig - Default configuration
 * @param {object} userConfig - User configuration
 * @returns {object} Merged configuration
 */
function mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };

    for (const [key, value] of Object.entries(userConfig)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            merged[key] = mergeConfigs(merged[key] || {}, value);
        } else {
            merged[key] = value;
        }
    }

    return merged;
}

/**
 * Validate configuration object
 * @param {object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
    // Validate output settings
    if (!['markdown', 'jsdoc'].includes(config.output.format)) {
        throw new Error('Invalid output format. Must be "markdown" or "jsdoc"');
    }

    // Validate parser settings
    if (!Array.isArray(config.parser.filePatterns)) {
        throw new Error('File patterns must be an array');
    }

    if (!Array.isArray(config.parser.exclude)) {
        throw new Error('Exclude patterns must be an array');
    }

    // Validate AI settings
    if (!['gpt-4', 'gpt-3.5-turbo'].includes(config.ai.model)) {
        throw new Error('Invalid AI model. Must be "gpt-4" or "gpt-3.5-turbo"');
    }

    if (config.ai.temperature < 0 || config.ai.temperature > 1) {
        throw new Error('Temperature must be between 0 and 1');
    }

    // Validate documentation settings
    if (!Array.isArray(config.documentation.includeTags)) {
        throw new Error('Include tags must be an array');
    }
}

/**
 * Get configuration value
 * @param {string} key - Configuration key (dot notation supported)
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Configuration value
 */
export function getConfig(key, defaultValue = undefined) {
    const keys = key.split('.');
    let value = config;

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return defaultValue;
        }
    }

    return value !== undefined ? value : defaultValue;
}

// Export default configuration for reference
export { DEFAULT_CONFIG };