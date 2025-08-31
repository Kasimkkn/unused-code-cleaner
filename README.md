# 🧹 Unused Code Cleaner

A powerful npm package that automatically detects and cleans unused imports, files, components, and dependencies from your JavaScript/TypeScript projects.

[![npm version](https://badge.fury.io/js/%40kasimkkn%2Funused-code-cleaner.svg)](https://badge.fury.io/js/%40kasimkkn%2Funused-code-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

## ✨ Features

- 🔍 **Comprehensive Analysis**: Detects unused files, imports, exports, and dependencies
- 📊 **Dual Output**: Terminal reports and JSON reports
- 🤖 **Interactive Mode**: Prompts for confirmation before making changes
- 🚀 **Automated Cleanup**: Option to auto-delete files and remove packages
- 🔄 **Git Integration**: Automatically commit and push cleaned code
- 📦 **Multiple Package Managers**: Supports npm, yarn, and pnpm
- 🎯 **Framework Agnostic**: Works with React, Vue, Angular, and vanilla JS/TS
- 🛡️ **Safe by Default**: Always asks for confirmation before making changes

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g @kasimkkn/unused-code-cleaner
```

### Local Installation
```bash
npm install --save-dev @kasimkkn/unused-code-cleaner
```

### Using npx (No Installation Required)
```bash
npx @kasimkkn/unused-code-cleaner
```

## 🚀 Usage

### Command Line Interface

#### Basic Analysis
```bash
# Analyze current directory
unused-cleaner

# Analyze specific project
unused-cleaner /path/to/your/project

# Quick scan without cleanup
unused-cleaner scan

# Generate JSON report only
unused-cleaner --json
```

#### Advanced Options
```bash
# Full analysis with custom options
unused-cleaner analyze \
  --path ./my-project \
  --output both \
  --report ./reports/cleanup.json \
  --message "Custom cleanup commit"

# Non-interactive mode with auto-cleanup
unused-cleaner analyze \
  --no-interactive \
  --auto-delete \
  --auto-push
```

### Programmatic Usage

```typescript
import { analyzeProject, UnusedCodeCleaner } from '@kasimkkn/unused-code-cleaner';

// Simple analysis
const report = await analyzeProject('./my-project');
console.log('Unused files:', report.unusedFiles);

// Advanced usage with custom options
const cleaner = new UnusedCodeCleaner('./my-project');
const report = await cleaner.analyze();

await cleaner.generateReport(report, 'json', './custom-report.json');
await cleaner.cleanup(report, {
  interactive: false,
  autoDelete: true
});
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `unused-cleaner` | Run interactive analysis on current directory |
| `unused-cleaner analyze` | Full analysis with all options |
| `unused-cleaner scan` | Quick scan without cleanup prompts |
| `unused-cleaner --help` | Show help information |
| `unused-cleaner --version` | Show version information |

## ⚙️ Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path <path>` | Project path to analyze | Current directory |
| `-o, --output <format>` | Output format: `json`, `console`, or `both` | `both` |
| `-r, --report <path>` | Custom path for JSON report | `./cleanup-report.json` |
| `--no-interactive` | Run without user prompts | `false` |
| `--auto-delete` | Automatically delete unused files | `false` |
| `--auto-push` | Automatically push to git | `false` |
| `-m, --message <msg>` | Custom git commit message | Auto-generated |
| `-q, --quick` | Quick scan mode | `false` |
| `-j, --json` | JSON output only | `false` |
| `-v, --version` | Show version number | - |
| `-h, --help` | Show help information | - |

## 📊 Report Structure

### Console Report
```
🧹 CLEANUP ANALYSIS REPORT
================================
📊 Total files scanned: 247
🕐 Analysis completed at: 8/31/2025, 2:30:15 PM

🗂️  Unused Files:
  Found 3 items:
    • src/legacy/old-component.tsx
    • utils/deprecated-helper.js
    • components/unused-modal.vue

📦 Unused Dependencies:
  Found 2 items:
    • lodash
    • moment

❌ Missing Dependencies:
  ✅ None found

💡 Run with --auto-delete to automatically clean up
```

### JSON Report
```json
{
  "unusedFiles": [
    "src/legacy/old-component.tsx",
    "utils/deprecated-helper.js"
  ],
  "unusedDependencies": [
    "lodash",
    "moment"
  ],
  "missingDependencies": [],
  "unusedExports": [
    "src/utils/helpers.ts:unusedFunction"
  ],
  "unusedImports": [
    "src/components/App.tsx:unusedImport"
  ],
  "totalFilesScanned": 247,
  "timestamp": "2025-08-31T09:00:15.123Z",
  "projectPath": "/path/to/project",
  "version": "1.0.0"
}
```

## 🔧 Configuration

Create a `.unusedrc.json` file in your project root:

```json
{
  "ignore": [
    "src/types/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.stories.ts",
    "**/*.d.ts",
    "public/**",
    "dist/**",
    "build/**"
  ],
  "extensions": [".js", ".jsx", ".ts", ".tsx", ".vue"],
  "dependencies": {
    "skipDevDependencies": false,
    "ignorePeerDependencies": true,
    "ignorePatterns": ["@types/*"]
  },
  "git": {
    "autoCommit": false,
    "autoPush": false,
    "commitMessage": "chore: clean up unused code"
  }
}
```

## 🛡️ Safety Features

- **Confirmation Prompts**: Always asks before deleting files or removing packages
- **Backup Recommendations**: Suggests creating backups before major cleanups
- **Git Integration**: Only pushes if you're in a git repository
- **Dry Run Mode**: Preview changes without executing them
- **Safe Defaults**: Interactive mode enabled by default
- **Rollback Support**: Git integration allows easy rollback of changes

## 🔍 What It Detects

### Unused Files
- Components never imported anywhere
- Utility files with no references
- Test files for deleted components
- Legacy files left behind after refactoring
- Asset files not referenced in code

### Unused Dependencies
- Packages in package.json not imported anywhere
- DevDependencies not used in build process
- Peer dependencies without actual usage
- Outdated packages with no references

### Missing Dependencies
- Imported packages not listed in package.json
- Required dependencies for build tools
- Peer dependencies that should be explicit

### Unused Exports/Imports
- Functions exported but never imported
- Named imports that aren't actually used
- Default exports without references

## 📋 Requirements

- **Node.js**: Version 16.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Git** (optional): For automatic commit and push features

## 🚨 Important Notes

- **Always backup your code** before running cleanup operations
- Test your application after cleanup to ensure nothing breaks
- Some dependencies might be used in ways the tool can't detect (e.g., webpack plugins, env files)
- Review the analysis carefully before confirming deletions
- Use version control to easily revert changes if needed

## 📚 Scripts Available

After installation, you can use these npm scripts in your project:

```json
{
  "scripts": {
    "clean:unused": "unused-cleaner",
    "analyze:code": "unused-cleaner scan",
    "cleanup:auto": "unused-cleaner --auto-delete --no-interactive"
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Code Cleanup Check
on: [push, pull_request]

jobs:
  unused-code-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx @kasimkkn/unused-code-cleaner scan --json
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/kasimkkn/unused-code-cleaner.git
cd unused-code-cleaner
npm install
npm run dev  # Start development mode
npm test     # Run tests
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Links

- 📚 [Documentation](https://github.com/kasimkkn/unused-code-cleaner/wiki)
- 🐛 [Report Issues](https://github.com/kasimkkn/unused-code-cleaner/issues)
- 💬 [Discussions](https://github.com/kasimkkn/unused-code-cleaner/discussions)
- 📦 [npm Package](https://www.npmjs.com/package/@kasimkkn/unused-code-cleaner)

## 📈 Changelog

### v1.0.0
- Initial release
- Comprehensive unused code detection
- Interactive cleanup mode
- Git integration
- JSON and console reporting
- Configuration file support

---

**Made with ❤️ for cleaner codebases by [Kasim kkn](https://github.com/kasimkkn)**

*Keep your codebase clean and your deployments fast!* ⚡