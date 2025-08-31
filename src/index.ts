import execa from "execa";
import fs from "fs-extra";
import simpleGit from "simple-git";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";

export interface AnalysisReport {
    unusedFiles: string[];
    unusedDependencies: string[];
    missingDependencies: string[];
    unusedExports: string[];
    unusedImports: string[];
    totalFilesScanned: number;
    timestamp: string;
}

export interface CleanupOptions {
    projectPath?: string;
    outputFormat?: 'json' | 'console' | 'both';
    interactive?: boolean;
    autoDelete?: boolean;
    autoPush?: boolean;
    gitCommitMessage?: string;
    reportPath?: string;
}

export class UnusedCodeCleaner {
    private projectPath: string;
    private git: any;

    constructor(projectPath: string = process.cwd()) {
        this.projectPath = path.resolve(projectPath);
        this.git = simpleGit(this.projectPath);
    }

    async analyze(): Promise<AnalysisReport> {
        console.log(chalk.cyan(`Analyzing project at: ${this.projectPath}`));

        // Check if package.json exists
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('No package.json found in the specified directory');
        }

        const report: AnalysisReport = {
            unusedFiles: [],
            unusedDependencies: [],
            missingDependencies: [],
            unusedExports: [],
            unusedImports: [],
            totalFilesScanned: 0,
            timestamp: new Date().toISOString()
        };

        try {
            // Run unimported analysis
            console.log(chalk.yellow("🔍 Scanning for unused imports and files..."));
            await this.runUnimportedAnalysis(report);

            // Run dependency analysis
            console.log(chalk.yellow("📦 Analyzing package dependencies..."));
            await this.analyzeDependencies(report);

            // Count total files
            report.totalFilesScanned = await this.countProjectFiles();

        } catch (error) {
            console.error(chalk.red("Analysis failed:"), error);
            throw error;
        }

        return report;
    }

    private async runUnimportedAnalysis(report: AnalysisReport): Promise<void> {
        try {
            const { stdout } = await execa("npx", ["unimported", "--json"], {
                cwd: this.projectPath,
                timeout: 60000
            });

            const result = JSON.parse(stdout);
            report.unusedFiles = result.unusedFiles || [];
            report.unusedImports = result.unusedImports || [];

        } catch (error) {
            console.log(chalk.yellow("⚠️  Unimported analysis failed, continuing with other checks..."));
        }
    }

    private async analyzeDependencies(report: AnalysisReport): Promise<void> {
        try {
            // Try to use depcheck for dependency analysis
            const { stdout } = await execa("npx", ["depcheck", "--json"], {
                cwd: this.projectPath,
                timeout: 60000
            });

            const result = JSON.parse(stdout);
            report.unusedDependencies = Object.keys(result.dependencies || {});
            report.missingDependencies = Object.keys(result.missing || {});

        } catch (error) {
            console.log(chalk.yellow("⚠️  Dependency analysis failed, trying alternative method..."));
            await this.fallbackDependencyAnalysis(report);
        }
    }

    private async fallbackDependencyAnalysis(report: AnalysisReport): Promise<void> {
        try {
            const packageJson = await fs.readJson(path.join(this.projectPath, 'package.json'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // Simple check by searching for imports in files
            const jsFiles = await this.findJSFiles();
            const usedDeps = new Set<string>();

            for (const file of jsFiles) {
                const content = await fs.readFile(file, 'utf-8');
                Object.keys(dependencies).forEach(dep => {
                    if (content.includes(`'${dep}'`) || content.includes(`"${dep}"`)) {
                        usedDeps.add(dep);
                    }
                });
            }

            report.unusedDependencies = Object.keys(dependencies).filter(dep => !usedDeps.has(dep));
        } catch (error) {
            console.log(chalk.red("Dependency analysis completely failed"));
        }
    }

    private async findJSFiles(): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

        async function scanDir(dir: string) {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await scanDir(fullPath);
                } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        }

        await scanDir(this.projectPath);
        return files;
    }

    private async countProjectFiles(): Promise<number> {
        const files = await this.findJSFiles();
        return files.length;
    }

    async generateReport(report: AnalysisReport, format: 'json' | 'console' | 'both' = 'both', outputPath?: string): Promise<void> {
        if (format === 'console' || format === 'both') {
            this.printConsoleReport(report);
        }

        if (format === 'json' || format === 'both') {
            const jsonPath = outputPath || path.join(this.projectPath, 'cleanup-report.json');
            await fs.writeJson(jsonPath, report, { spaces: 2 });
            console.log(chalk.blue(`📄 JSON report saved to: ${jsonPath}`));
        }
    }

    private printConsoleReport(report: AnalysisReport): void {
        console.log(chalk.magenta("\n" + "=".repeat(50)));
        console.log(chalk.magenta("           🧹 CLEANUP ANALYSIS REPORT"));
        console.log(chalk.magenta("=".repeat(50)));

        console.log(chalk.cyan(`📊 Total files scanned: ${report.totalFilesScanned}`));
        console.log(chalk.cyan(`🕐 Analysis completed at: ${new Date(report.timestamp).toLocaleString()}\n`));

        this.printSection("🗂️  Unused Files", report.unusedFiles);
        this.printSection("📦 Unused Dependencies", report.unusedDependencies);
        this.printSection("❌ Missing Dependencies", report.missingDependencies);
        this.printSection("🔗 Unused Exports", report.unusedExports);
        this.printSection("📥 Unused Imports", report.unusedImports);
    }

    private printSection(title: string, items: string[]): void {
        console.log(chalk.bold(`\n${title}:`));
        if (items.length === 0) {
            console.log(chalk.green("  ✅ None found"));
        } else {
            console.log(chalk.red(`  Found ${items.length} items:`));
            items.forEach(item => console.log(chalk.gray(`    • ${item}`)));
        }
    }

    async cleanup(report: AnalysisReport, options: CleanupOptions = {}): Promise<void> {
        const { interactive = true } = options;

        // Delete unused files
        if (report.unusedFiles.length > 0) {
            const shouldDelete = interactive
                ? await this.promptConfirmation(`Delete ${report.unusedFiles.length} unused files?`)
                : options.autoDelete || false;

            if (shouldDelete) {
                await this.deleteFiles(report.unusedFiles);
            }
        }

        // Remove unused dependencies
        if (report.unusedDependencies.length > 0) {
            const shouldRemove = interactive
                ? await this.promptConfirmation(`Remove ${report.unusedDependencies.length} unused dependencies?`)
                : options.autoDelete || false;

            if (shouldRemove) {
                await this.removeDependencies(report.unusedDependencies);
            }
        }

        // Git operations
        if (await this.isGitRepo()) {
            const shouldPush = interactive
                ? await this.promptConfirmation("Commit and push changes to Git?")
                : options.autoPush || false;

            if (shouldPush) {
                await this.commitAndPush(options.gitCommitMessage || "🧹 Auto-cleanup: removed unused files and dependencies");
            }
        }
    }

    private async promptConfirmation(message: string): Promise<boolean> {
        const { confirmed } = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmed",
                message,
                default: false
            }
        ]);
        return confirmed;
    }

    private async deleteFiles(files: string[]): Promise<void> {
        console.log(chalk.yellow(`\n🗑️  Deleting ${files.length} files...`));

        for (const file of files) {
            try {
                const fullPath = path.resolve(this.projectPath, file);
                await fs.remove(fullPath);
                console.log(chalk.green(`  ✅ Deleted: ${file}`));
            } catch (error) {
                console.log(chalk.red(`  ❌ Failed to delete ${file}: ${error}`));
            }
        }
    }

    private async removeDependencies(dependencies: string[]): Promise<void> {
        console.log(chalk.yellow(`\n📦 Removing ${dependencies.length} unused dependencies...`));

        try {
            await execa("npm", ["uninstall", ...dependencies], {
                cwd: this.projectPath,
                stdio: "inherit"
            });
            console.log(chalk.green("✅ Dependencies removed successfully"));
        } catch (error) {
            console.log(chalk.red(`❌ Failed to remove dependencies: ${error}`));
        }
    }

    private async isGitRepo(): Promise<boolean> {
        try {
            await this.git.status();
            return true;
        } catch {
            return false;
        }
    }

    private async commitAndPush(message: string): Promise<void> {
        try {
            console.log(chalk.yellow("\n🔄 Committing changes..."));
            await this.git.add('.');
            await this.git.commit(message);

            console.log(chalk.yellow("📤 Pushing to remote..."));
            await this.git.push();

            console.log(chalk.green("✅ Changes pushed successfully"));
        } catch (error) {
            console.log(chalk.red(`❌ Git operations failed: ${error}`));
        }
    }
}

// Export for programmatic use
export async function analyzeProject(projectPath?: string, options: CleanupOptions = {}): Promise<AnalysisReport> {
    const cleaner = new UnusedCodeCleaner(projectPath);
    const report = await cleaner.analyze();

    await cleaner.generateReport(report, options.outputFormat, options.reportPath);

    if (options.interactive !== false) {
        await cleaner.cleanup(report, options);
    }

    return report;
}