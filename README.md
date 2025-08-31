# 🧹 Unused Code Cleaner

A powerful npm package that automatically detects and cleans unused imports, files, components, and dependencies from your JavaScript/TypeScript projects.

## ✨ Features

- 🔍 **Comprehensive Analysis**: Detects unused files, imports, exports, and dependencies
- 📊 **Dual Output**: Terminal reports and JSON reports
- 🤖 **Interactive Mode**: Prompts for confirmation before making changes
- 🚀 **Automated Cleanup**: Option to auto-delete files and remove packages
- 🔄 **Git Integration**: Automatically commit and push cleaned code
- 📦 **Multiple Package Managers**: Supports npm, yarn, and pnpm
- 🎯 **Framework Agnostic**: Works with React, Vue, Angular, and vanilla JS/TS

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g unused-code-cleaner
```

### Local Installation
```bash
npm install --save-dev unused-code-cleaner
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
import { analyzeProject, UnusedCodeCleaner } from 'unused-code-cleaner';

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
  "timestamp": "2025-08-31T09:00:15.123Z"
}
```

## 🔧 Configuration

Create a `.unusedrc.json` file in your project root:

```json
{
  "ignore": [
    "src/types/**",
    "**/*.test.ts",
    "**/*.stories.ts"
  ],
  "extensions": [".js", ".jsx", ".ts", ".tsx", ".vue"],
  "dependencies": {
    "skipDevDependencies": false,
    "ignorePeerDependencies": true
  }
}
```

## 🛡️ Safety Features

- **Confirmation Prompts**: Always asks before deleting files or removing packages
- **Backup Recommendations**: Suggests creating backups before major cleanups
- **Git Integration**: Only pushes if you're in a git repository
- **Dry Run Mode**: Preview changes without executing them

## 🔍 What It Detects

### Unused Files
- Components never imported
- Utility files with no references
- Test files for deleted components
- Legacy files left behind

### Unused Dependencies
- Packages in package.json not imported anywhere
- DevDependencies not used in build process
- Peer dependencies without usage

### Missing Dependencies
- Imported packages not in package.json
- Required dependencies for build tools

### Unused Exports/Imports
- Functions exported but never imported
- Named imports that aren't used

## 🚨 Important Notes

- **Always backup your code** before running cleanup operations
- Test your application after cleanup to ensure nothing breaks
- Some dependencies might be used in ways the tool can't detect (e.g., webpack plugins)
- Review the analysis before confirming deletions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](https://github.com/kasimkkn/unused-code-cleaner/wiki)
- 🐛 [Report Issues](https://github.com/kasimkkn/unused-code-cleaner/issues)
- 💬 [Discussions](https://github.com/kasimkkn/unused-code-cleaner/discussions)

---

**Made with ❤️ for cleaner codebases**