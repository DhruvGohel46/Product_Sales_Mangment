# Product Sales Management - Electron Desktop App

## Overview
This is the Electron desktop application version of the Product Sales Management system.

## Development
```bash
# Install dependencies
npm install

# Start development mode (runs React dev server and Electron)
npm run electron:dev

# Build for production
npm run electron:build
```

## Features
- Native desktop application
- Menu integration (File, View, Window)
- Keyboard shortcuts
- System integration
- Auto-updater support (can be added)
- Custom icon and branding

## Build Output
- Windows: `.exe` installer in `dist/` folder
- Cross-platform builds supported

## Security
- Context isolation enabled
- Node integration disabled
- Preload script for secure IPC communication
- External links handled by system browser

## Notes
- Backend API should be running separately
- Default backend URL: `http://localhost:5050`
- Frontend port: `3050` (development)
