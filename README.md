# Laravel Larex Watcher

[![GitHub Repository](https://img.shields.io/badge/GitHub-Lukasss93/larex--watcher-blue?logo=github)](https://github.com/Lukasss93/larex-watcher)

A Vite plugin that watches for changes in the LAREX localization CSV file and automatically regenerates localization files during development and build.

## About

This plugin is a supporting tool for the [lukasss93/laravel-larex](https://github.com/Lukasss93/laravel-larex) PHP library, which must be installed in your Laravel project via Composer:

```bash
composer require lukasss93/laravel-larex
```

Additionally, make sure your `composer.json` includes the following script:

```json
{
  "scripts": {
    "larex": "@php artisan larex:export"
  }
}
```

## Installation

```bash
npm install -D @lukasss93/larex-watcher
```

## Configuration

Add the plugin to your `vite.config.ts`:

```typescript
import larex from '@lukasss93/larex-watcher/vite';

export default {
  plugins: [
    larex({
      path: 'lang/localization.csv',      // Path to the localization CSV file
      command: 'composer run larex',       // Command to execute
      build: true,                          // Run on build
      dev: true,                            // Run on development server start
    }),
  ],
};
```

### Important: Disable Vite Laravel Plugin Refresh on `/lang`

To prevent unnecessary reloads when localization files are updated, configure the Laravel Vite plugin to ignore the `/lang` directory:

```typescript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import larex from '@lukasss93/larex-watcher/vite';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: [
        'app/**',
        'config/**',
        'resources/views/**',
        // Exclude /lang directory to prevent unnecessary reloads
        // 'lang/**' should NOT be included here
      ],
    }),
    larex(),
  ],
});
```

## How It Works

The Laravel Larex Watcher plugin automates the localization workflow in your Laravel + Vite project:

### Development Mode

1. **File Watching**: The plugin monitors the CSV localization file (default: `lang/localization.csv`) for changes.
2. **Debounced Execution**: When the file changes, it waits 200ms to debounce rapid changes, then executes the configured command.
3. **Hot Module Reload**: After successfully updating localization files, it invalidates all modules in Vite and triggers a full page reload to reflect the changes immediately.
4. **Error Handling**: If the command fails, an error message is displayed in the console.

### Build Mode

1. **Pre-build Execution**: During the build process, the plugin runs the command before bundling starts.
2. **Automatic Export**: This ensures that all localization files are up-to-date before deploying to production.

### Default Behavior

- **Command**: `composer run larex` (executes `@php artisan larex:export`)
- **Watched File**: `lang/localization.csv`
- **Run on Dev**: Yes (watches for changes during development)
- **Run on Build**: Yes (updates localization files during production build)

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | string | `lang/localization.csv` | Path to the localization CSV file to watch |
| `command` | string | `composer run larex` | Command to execute when the file changes |
| `dev` | boolean | `true` | Enable watching during development |
| `build` | boolean | `true` | Enable execution during build |

## License

MIT
