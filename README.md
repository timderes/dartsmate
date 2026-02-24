# :dart: DartsMate

<img alt="DartsMate app screenshot showing a live dart match between players 'nap' and 'musti', with scores, statistics, and buttons." src="resources/github-preview.jpg" style="height: auto; width: 100%;" />

**Analyze, compare and track your dart games with DartsMate - Built with [nextron](https://github.com/saltyshiomix/nextron), [Next.js](https://github.com/vercel/next.js) & [Mantine](https://github.com/mantinedev/mantine)**

:warning: The project is currently still a work in progress. Many functions and ideas are not implemented yet!

---

### Project Status

![GitHub Release](https://img.shields.io/github/v/release/timderes/dartsmate)
![GitHub License](https://img.shields.io/github/license/timderes/dartsmate)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/timderes/dartsmate/total)
![GitHub Repo stars](https://img.shields.io/github/stars/timderes/dartsmate)

### Repository Status

![Last Commit](https://img.shields.io/github/last-commit/timderes/dartsmate)
![GitHub Issues](https://img.shields.io/github/issues/timderes/dartsmate)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/timderes/dartsmate)
![GitHub Discussions](https://img.shields.io/github/discussions/timderes/dartsmate)

![GitHub top language](https://img.shields.io/github/languages/top/timderes/dartsmate)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/timderes/dartsmate)

---

## Features

- **Create & Manage Profiles:** Easily create and manage player profiles for your matches.
- **Create A Match:** Set up a game with and customize various game settings.
- **Analyze Your Latest Matches:** Gain valuable insights into your performance and track your progress.
- **Multi-Language Support:** DartsMate supports multiple languages, allowing users to enjoy the app in their preferred language.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/timderes/dartsmate.git

# Install dependencies
npm install

# Start the development environment
npm run dev
```

### Tech Stack

- [Nextron](https://github.com/saltyshiomix/nextron) – Framework combining Electron + Next.js
- [Next.js](https://github.com/vercel/next.js) – React-based frontend framework
- [Mantine](https://github.com/mantinedev/mantine) – UI component library
- [Electron Builder](https://github.com/electron-userland/electron-builder) – Packaging and release tool
- [Dexie](https://github.com/dexie/Dexie.js) – IndexedDB wrapper
- [Vitest](https://github.com/vitest-dev/vitest) – Testing framework

## Contributing

**Contributions to DartsMate are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to open an issue and submit a pull request.**

For more details on contributing, please refer to the [CONTRIBUTING file](CONTRIBUTING.md).

### Contributors

See the full list of contributors [here](CONTRIBUTORS.md).

## Scripts

| Script                  | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`           | Starts the Nextron development environment with hot reloading                                |
| `npm run build`         | Builds a production-ready app for the current platform                                       |
| `npm run build:all`     | Builds production-ready versions for **all** supported platforms (Windows, macOS, and Linux) |
| `npm run build:win32`   | Builds a **Windows 32-bit** executable                                                       |
| `npm run build:win64`   | Builds a **Windows 64-bit** executable                                                       |
| `npm run build:mac`     | Builds a **macOS** application<br>⚠️ Requires building on a macOS machine                    |
| `npm run build:linux`   | Builds a **Linux** executable                                                                |
| `npm run postinstall`   | Installs required native dependencies via electron-builder                                   |
| `npm run lint`          | Runs ESLint on both the main and renderer processes to check for code issues                 |
| `npm run lint:main`     | Lints only the **main process** code                                                         |
| `npm run lint:renderer` | Lints only the **renderer process** code                                                     |
| `npm run lint:fix`      | Runs ESLint on both processes and automatically fixes simple issues                          |
| `npm run format`        | Formats all source files using Prettier                                                      |
| `npm run format:check`  | Checks code formatting without applying fixes                                                |
| `npm run release`       | Builds and publishes a new release using electron-builder                                    |
| `npm run test`          | Runs tests using Vitest                                                                      |
