import { UnusedCodeCleaner } from '../src/index';
import fs from 'fs-extra';
import path from 'path';

describe('UnusedCodeCleaner', () => {
    let tempDir: string;
    let cleaner: UnusedCodeCleaner;

    beforeEach(async () => {
        // Create temporary test directory
        tempDir = path.join(__dirname, 'temp-test-project');
        await fs.ensureDir(tempDir);

        // Create a basic package.json
        await fs.writeJson(path.join(tempDir, 'package.json'), {
            name: 'test-project',
            version: '1.0.0',
            dependencies: {
                'lodash': '^4.17.21'
            },
            devDependencies: {
                'unused-package': '^1.0.0'
            }
        });

        // Create some test files
        await fs.ensureDir(path.join(tempDir, 'src'));
        await fs.writeFile(
            path.join(tempDir, 'src/index.js'),
            `import lodash from 'lodash';\nconsole.log(lodash);`
        );
        await fs.writeFile(
            path.join(tempDir, 'src/unused.js'),
            `// This file is never imported\nconst unused = true;`
        );

        cleaner = new UnusedCodeCleaner(tempDir);
    });

    afterEach(async () => {
        // Cleanup temp directory
        if (await fs.pathExists(tempDir)) {
            await fs.remove(tempDir);
        }
    });

    test('should initialize with project path', () => {
        expect(cleaner).toBeInstanceOf(UnusedCodeCleaner);
    });

    test('should analyze project and return report', async () => {
        const report = await cleaner.analyze();

        expect(report).toBeDefined();
        expect(report.timestamp).toBeDefined();
        expect(report.totalFilesScanned).toBeGreaterThan(0);
        expect(Array.isArray(report.unusedFiles)).toBe(true);
        expect(Array.isArray(report.unusedDependencies)).toBe(true);
    });

    test('should throw error when no package.json exists', async () => {
        const invalidCleaner = new UnusedCodeCleaner('/non/existent/path');
        await expect(invalidCleaner.analyze()).rejects.toThrow();
    });

    test('should generate JSON report', async () => {
        const report = await cleaner.analyze();
        const reportPath = path.join(tempDir, 'test-report.json');

        await cleaner.generateReport(report, 'json', reportPath);

        const savedReport = await fs.readJson(reportPath);
        expect(savedReport.timestamp).toBe(report.timestamp);
    });
});