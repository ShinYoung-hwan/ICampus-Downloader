# Copilot Instructions for ICampus-Downloader

## Project Architecture & Big Picture
- Chrome extension for SKKU ICampus video download; injects UI and download logic into lecture pages.
- Main workflow: content script (`src/content-script.ts` → `dist/content-script.js`) runs on matching URLs, modifies video control bar, and manages download state.
- Download progress is shown via a custom progress bar injected into the video area.
- Popup UI (`popup/`) is for extension action, not for main download logic.

## Key Components & Data Flow
- `src/content-script.ts`: Core logic for UI injection, video URL extraction, download button, and progress bar.
- `content/content.css`: Styles for injected UI (button, progress bar). Progress bar is positioned absolutely at the top by default; can be moved to bottom by changing `top: 0;` to `bottom: 0;`.
- `images/`: Extension icons and button images (see manifest for web_accessible_resources).
- `manifest.json`: Declares permissions, content scripts, and resource access. `all_frames: true` means scripts run in iframes as well.

## Developer Workflow
- Build: `npm run build` (TypeScript → JS in `dist/`).
- Watch: `npm run watch` for auto-rebuild on changes.
- Test: Load as unpacked extension in Chrome (`chrome://extensions`).
- Debug: Use Chrome DevTools on the target ICampus page; inspect injected elements and network requests.
- No automated tests; manual browser testing is standard.

## Patterns & Conventions
- UI changes are made by injecting DOM elements via `content.js`.
- Download logic is triggered by user interaction with the injected button.
- Button state (enabled/disabled) reflects download progress to prevent duplicate actions.
- Filenames are user-customizable via a prompt.
- Korean language is used for user-facing messages and documentation.

## Integration Points & External Dependencies
- No external JS libraries; all logic is custom.
- Uses Chrome extension APIs for permissions and resource access.
- Images referenced in CSS use `chrome-extension://...` URLs and must be listed in `manifest.json`.

## Example: Download Button Injection
- See `src/content-script.ts` for:
  - How the download button is injected into the video control bar
  - How the progress bar is created and positioned
  - How download state is managed

## Cautions
- For personal use only; do not use to download or share copyrighted content.

---
If any workflow, convention, or integration is unclear, ask the user for clarification or examples from their usage.
