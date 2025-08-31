import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { analyzeProject, CleanupOptions } from './index.js';

const program = new Command();

program
    .name('unused-cleaner')
    .description('🧹 Automatically detect and clean unused code from your project')
    .version('1.0.0');

program
    .command('analyze')
    .description('Analyze project for unused files, imports, and dependencies')
    .option('-p, --path <path>', 'Project path to analyze', process.cwd())
    .option('-o, --output <format>', 'Output format: json, console, or both', 'both')
    .option('-r, --report <path>', 'Custom path for JSON report')
    .option('--no-interactive', 'Run in non-interactive mode')
    .option('--auto-delete', 'Automatically delete unused files (use with caution)')
    .option('--auto-push', 'Automatically push changes to git')
    .option('-m, --message <message>', 'Custom git commit message')
    .action(async (options) => {
        try {
            const cleanupOptions: CleanupOptions = {
                projectPath: path.resolve(options.path),
                outputFormat: options.output,
                reportPath: options.report,
                interactive: options.interactive,
                autoDelete: options.autoDelete,
                autoPush: options.autoPush,
                gitCommitMessage: options.message
            };

            console.log(chalk.cyan('🚀 Starting analysis...\n'));

            const report = await analyzeProject(cleanupOptions.projectPath, cleanupOptions);

            console.log(chalk.green('\n✨ Analysis completed successfully!'));

            if (report.unusedFiles.length === 0 && report.unusedDependencies.length === 0) {
                console.log(chalk.green('🎉 Your project is already clean! No unused files or dependencies found.'));
            }

        } catch (error) {
            console.error(chalk.red('❌ Analysis failed:'), error);
            process.exit(1);
        }
    });

program
    .command('scan')
    .description('Quick scan without cleanup options')
    .option('-p, --path <path>', 'Project path to analyze', process.cwd())
    .action(async (options) => {
        try {
            const cleanupOptions: CleanupOptions = {
                projectPath: path.resolve(options.path),
                outputFormat: 'console',
                interactive: false
            };

            await analyzeProject(cleanupOptions.projectPath, cleanupOptions);
        } catch (error) {
            console.error(chalk.red('❌ Scan failed:'), error);
            process.exit(1);
        }
    });

// Default command when no subcommand is provided
program
    .argument('[path]', 'Project path to analyze', process.cwd())
    .option('-q, --quick', 'Quick scan mode')
    .option('-j, --json', 'Output JSON report only')
    .action(async (projectPath, options) => {
        if (options.quick) {
            console.log(chalk.cyan('🔍 Running quick scan...\n'));
            await analyzeProject(path.resolve(projectPath), {
                outputFormat: 'console',
                interactive: false
            });
        } else if (options.json) {
            await analyzeProject(path.resolve(projectPath), {
                outputFormat: 'json',
                interactive: false
            });
        } else {
            console.log(chalk.cyan('🧹 Welcome to Unused Code Cleaner!\n'));
            console.log('Use --help to see available commands\n');

            await analyzeProject(path.resolve(projectPath), {
                outputFormat: 'both',
                interactive: true
            });
        }
    });

program.parse();

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled error:'), error);
    process.exit(1);
});

export default program;