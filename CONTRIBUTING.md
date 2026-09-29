# Contributing

Thanks for helping people work with the fonts they installed.

## Start with an issue

Search open issues before you start. For a bug, include your Windows version, app version, the steps you took, what you expected, and what you saw. Attach a screenshot when it helps. Do not attach commercial font files or a backup with personal notes.

For a new feature, describe the task you want to complete and the part of the app you would change. Discuss large changes in an issue before you write code.

## Run the app

Use Windows x64 and Node.js 24. Run `npm ci`, `npm run build`, and `npm run app`. Run `npm run dist` when you need to inspect the installer.

## Send a pull request

Keep each pull request focused. Explain the behavior you changed and show screenshots for interface changes. Run `npm run build` before you submit. Test font discovery with a font you install and remove through Windows if you change the scanner. Do not commit font binaries, build folders, backups, or personal data.

We review behavior, accessibility, and whether the change fits the local-only design. Please follow our [code of conduct](CODE_OF_CONDUCT.md).
