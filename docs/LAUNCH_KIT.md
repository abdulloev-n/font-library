# GitHub launch kit

Use these fields when you publish the repository. The repository needs a GitHub owner before anyone can add working links or a build badge.

## Repository settings

**Name:** `font-library`

**Description:** Browse, compare, and organize the fonts installed on your Windows PC. Local-first desktop app with variable font controls and Type Studio.

**Topics:** `fonts`, `typography`, `font-manager`, `variable-fonts`, `windows`, `desktop-app`, `electron`, `react`, `open-source`, `design-tools`

**Website:** Leave empty until you have a real site or documentation URL.

**Social preview:** Upload `docs/social-preview.png` in **Settings → General → Social preview**. GitHub recommends 1280 × 640 pixels.

## Publish sequence

1. Create a public GitHub repository named `font-library` with no generated README or license. Upload this folder as the repository root. Use `main` as the default branch.
2. Turn on Dependabot alerts, secret scanning, and private vulnerability reporting in **Settings → Security**. Review the contact text in `SECURITY.md` after you set up a private route.
3. Check the README screenshots and the **Build** workflow on GitHub. Fix any broken relative link before you announce the release.
4. Create and push tag `v1.0.0`. The release workflow builds the Windows installer and creates a **draft** release. Check the attached EXE, title, and notes, then publish that draft. If you prefer to use the already-built installer, create the release in the GitHub UI and attach `Font-Library-Setup-1.0.0.exe` from the delivery folder.
5. Add the repository description and topics above. Upload the social preview. Pin the repository on your profile if you want it visible there.
6. Share a short demo that shows a real font disappearing from the catalog after Windows removes it. Invite specific bug reports and suggestions from typography and Windows communities. Follow each community's posting rules.

GitHub Trending reflects community activity. Nobody can guarantee placement. A useful demo, clear install path, and prompt issue replies give interested people a reason to try the app and contribute.

## Announcement copy

**Short post**

I built Font Library for Windows. Preview every font you installed, compare up to four choices, tune variable font axes, and save layouts in Type Studio. The app reads your current Windows fonts, so a font you remove through Windows leaves the catalog after the next scan. Your notes and projects stay on your PC. The source and Windows installer are on GitHub: [add repository link after publishing].

**Release headline**

Font Library 1.0.0: a local home for the fonts on your Windows PC

## Asset checklist

- `README.md` shows a real catalog screenshot and the download path.
- `docs/screenshots/` contains Library, Detail, Compare, and Type Studio views.
- `docs/social-preview.png` fits GitHub's recommended preview size.
- `docs/releases/v1.0.0.md` contains release notes.
- `.github/` contains the build, draft release with SHA-256 checksum, issue forms, pull request template, and Dependabot settings.
- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` explain reuse and participation.
