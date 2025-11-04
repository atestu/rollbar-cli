# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

rollbar-cli is a Node.js CLI tool for interacting with Rollbar's API. It provides two main commands:
- `upload-sourcemaps`: Upload source maps for JavaScript error tracking
- `notify-deploy`: Notify Rollbar about deployments

## Development Commands

### Testing
```bash
npm test
```
Runs the full test suite using Mocha with NYC coverage reporting (HTML and text output).

### Linting
```bash
npm run lint
```
Runs ESLint on all `.js` files in the project.

### Local Development Setup
```bash
npm install
npm link
```
Links the CLI to your local repo for testing changes. After linking, you can run `rollbar-cli` commands from anywhere on your system.

### Running Individual Tests
```bash
npx mocha test/sourcemaps.test.js
npx mocha test/deploy.test.js
```

## Architecture

### Entry Point
- `bin/rollbar` - Executable script that loads `src/index.js`
- `src/index.js` - Main CLI setup using yargs, registers commands

### Command Pattern
The CLI uses yargs command modules with a consistent structure:
- `command`: Command string with positional args
- `describe`: Command description
- `builder`: Function to define command options
- `handler`: Async function that executes the command

Each command creates a global `output` object for logging (verbose/quiet modes).

### Source Maps Feature (`src/sourcemaps/`)
- `command.js` - Yargs command definition
- `scanner.js` - Scans directory for JS files, finds sourceMappingURL directives, validates source maps
- `uploader.js` - Legacy upload: individual file uploads to Rollbar API
- `signed-url-uploader.js` - Next version: zips files and uploads to signed URL
- `requester.js` - Handles API requests for signed URL upload flow

The upload flow:
1. Scanner finds all `.js` files in target path
2. Extracts `sourceMappingURL` comments to locate `.map` files
3. Validates source maps using `source-map` library
4. Legacy mode: uploads each file individually
5. Next mode (`--next` flag): creates zip file and uploads via signed URL

### Deploy Feature (`src/deploy/`)
- `command.js` - Yargs command definition
- `deployer.js` - Makes POST request to Rollbar deploy API

### Common Utilities (`src/common/`)
- `output.js` - Handles verbose/quiet output modes
- `rollbar-api.js` - Base API client for Rollbar endpoints

### Global State
The codebase uses a global `output` object (see `.eslintrc` globals) initialized in each command handler. This provides consistent logging across all modules.

### Test Structure
Tests are organized in `test/` mirroring the `src/` structure:
- Integration tests: `test/sourcemaps.test.js`, `test/deploy.test.js`
- Unit tests: `test/sourcemaps/`, `test/deploy/`, `test/common/`
- Test fixtures: `test/fixtures/` contains sample JS/map files

### ESLint Configuration
- Extends `eslint:recommended`
- ES6 with async/await support (ecmaVersion: 8)
- Enforces single quotes, camelCase (except properties), no var
- Max complexity: 35
- Global `output` object allowed
