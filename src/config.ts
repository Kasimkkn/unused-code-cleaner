import fs from 'fs-extra';
import path from 'path';

export interface Config {
    ignore?: string[];
    extensions?: string[];
    dependencies?: {
        skipDevDependencies?: boolean;
        ignorePeerDependencies?: boolean;
        customIgnore?: string[];
    };
    files?: {
        includeTests?: boolean;
        includeStories?: boolean;
        customIgnore?: string[];
    };
    git?: {
        defaultBranch?: string;
        commitMessage?: string;
    };
    analysis?: {
        timeout?: number;
        skipUnimported?: boolean;
        skipDepcheck?: boolean;
    };
}

export const DEFAULT_CONFIG: Config = {
    ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/__tests__/**',
        '**/coverage/**',
        '**/.git/**'
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'],
    dependencies: {
        skipDevDependencies: false,
        ignorePeerDependencies: true,
        customIgnore: ['@types/*']
    },
    files: {
        includeTests: false,
        includeStories: false,
        customIgnore: []
    },
    git: {
        defaultBranch: 'main',
        commitMessage: '🧹 Auto-cleanup: removed unused files and dependencies'
    },
    analysis: {
        timeout: 60000,
        skipUnimported: false,
        skipDepcheck: false
    }
};

export async function loadConfig(projectPath: string): Promise<Config> {
    const configPaths = [
        '.unusedrc.json',
        '.unusedrc.js',
        'unused.config.js',
        'unused.config.json'
    ];

    for (const configPath of configPaths) {
        const fullPath = path.join(projectPath, configPath);

        if (await fs.pathExists(fullPath)) {
            try {
                let config: Config;

                if (configPath.endsWith('.js')) {
                    // Dynamic import for JS config files
                    const configModule = await import(fullPath);
                    config = configModule.default || configModule;
                } else {
                    // JSON config files
                    config = await fs.readJson(fullPath);
                }

                return mergeConfig(DEFAULT_CONFIG, config);
            } catch (error) {
                console.warn(`Failed to load config from ${configPath}:`, error);
            }
        }
    }

    return DEFAULT_CONFIG;
}

function mergeConfig(defaultConfig: Config, userConfig: Config): Config {
    return {
        ...defaultConfig,
        ...userConfig,
        dependencies: {
            ...defaultConfig.dependencies,
            ...userConfig.dependencies
        },
        files: {
            ...defaultConfig.files,
            ...userConfig.files
        },
        git: {
            ...defaultConfig.git,
            ...userConfig.git
        },
        analysis: {
            ...defaultConfig.analysis,
            ...userConfig.analysis
        }
    };
}