# Architecture

## Process boundaries

Electron starts the Windows app in `electron/main.cjs`. The main process owns filesystem access, Windows font discovery, and the local JSON data file. `electron/preload.cjs` exposes a small IPC API to the renderer. The renderer in `src/main.tsx` uses React and renders the English interface. `src/style.css` holds color tokens, typography, and layout rules.

The renderer uses context isolation and does not receive Node.js access. The custom `fontlib:` protocol serves font files that the scanner has registered. The app does not run a server or ask you to sign in.

## Font discovery

`electron/fonts.cjs` reads Windows font registrations for the current user and the machine. It resolves registered paths, checks whether each file exists, and uses fontkit to read names, styles, character coverage, and variation axes. The renderer requests a new scan on launch, on window focus, each minute while open, and when you select **Rescan**.

The app keeps a font in the catalog while Windows still registers an existing installed file. Deleting an original download after installation does not remove the installed copy. Removing the font through Windows removes it from the next scan.

## Local data

Electron stores favorites, collections, notes, ratings, hidden items, pairings, saved samples, projects, and theme in `library.json` under Electron's user data directory. The app writes to a temporary file before replacing the current file. Backup import and export use JSON. The app does not embed or copy font binaries into backups.

## Build

Vite builds the React renderer into `dist/`. Electron loads those local files in a packaged build. `scripts/make-icon.cjs` creates the Windows icon. electron-builder creates the NSIS installer in `dist-installer/`. GitHub Actions runs the build on Windows; a version tag creates a draft GitHub Release with the installer attached.
