 Product Sales Management - Electron Desktop App

## Overview
This is the Electron desktop application version of the Product Sales Management system. It provides a native desktop experience with enhanced features and system integration.

## Prerequisites
- Node.js 16+ 
- Python 3.7+
- Windows 10/11 (for .exe build)

## Installation & Setup

### 1. Install Dependencies
```bash
# Install root dependencies (Electron)
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Development Mode

#### Option 1: Quick Start (Recommended)
```bash
# Double-click this file or run:
electron-start.bat
```

#### Option 2: Manual Start
```bash
# Start backend and frontend together
npm run dev

# Or start individually:
# Terminal 1 - Backend:
npm run backend

# Terminal 2 - Frontend + Electron:
npm run electron-dev
```

### 3. Build for Production

#### Build .exe Installer
```bash
# Build React app and create Windows installer
npm run build-all

# Output will be in: dist/Product Sales Management Setup 1.0.0.exe
```

#### Alternative Build Commands
```bash
# Build only (no packaging)
npm run build

# Build and package
npm run electron-pack
```

## Features

### Desktop-Specific Features
- **Native Menu Bar**: File, View, Window menus with keyboard shortcuts
- **System Integration**: Desktop shortcuts, start menu entries
- **Window Management**: Minimize, maximize, close functionality
- **Keyboard Shortcuts**: Ctrl+N (New Bill), Ctrl+Q (Quit), F11 (Fullscreen)
- **Auto-updater**: Built-in update mechanism (configurable)
- **Security**: Context isolation, sandboxed renderer process

### Application Features
- **Product Management**: Add, edit, deactivate products
- **POS Billing**: Create bills with automatic printing
- **Analytics Dashboard**: Sales reports and insights
- **Thermal Printer Support**: TVS Champ RP Series integration
- **Data Export**: Excel/CSV reports
- **Password Protection**: Secure admin functions

## Configuration

### Backend Configuration
- **Port**: 5050 (configurable in `backend/app.py`)
- **Database**: SQLite at `backend/data/products.db`
- **Printer**: TVS Champ RP Series (auto-detected)

### Frontend Configuration
- **Port**: 3050 (configurable in `package.json`)
- **API URL**: `http://localhost:5050` (auto-configured)

### Electron Configuration
- **App ID**: `com.burgerbhau.product-sales-management`
- **Product Name**: `Product Sales Management`
- **Main Process**: `electron/main.js`
- **Preload Script**: `electron/preload.js`

## File Structure
```
Product_Sales_Mangment/
├── electron/
│   ├── main.js           # Main Electron process
│   ├── preload.js        # Security bridge
│   └── assets/           # Icons and resources
├── frontend/             # React application
├── backend/              # Flask API server
├── dist/                 # Build output
└── package.json          # Root configuration
```

## Development Notes

### Security Features
- Context isolation enabled
- Node integration disabled
- Preload script for secure IPC
- External links handled by system browser

### Performance Optimizations
- Lazy loading of components
- Optimized bundle size
- Efficient memory management
- Hardware acceleration

### Troubleshooting

#### Common Issues
1. **Backend not starting**: Check Python dependencies
2. **Frontend not loading**: Check port conflicts
3. **Electron crashes**: Check console for errors
4. **Printer not working**: Check Windows printer drivers

#### Debug Mode
- Development mode opens DevTools automatically
- Check console for error messages
- Backend logs show in terminal window

## Deployment

### Windows Installer (.exe)
- Creates desktop shortcut
- Adds to Start Menu
- Supports custom installation path
- Includes uninstaller

### Distribution
- Single installer file
- No external dependencies
- Self-contained application
- Automatic updates (optional)

## Support

For issues and support:
1. Check the console logs
2. Verify backend is running on port 5050
3. Ensure all dependencies are installed
4. Check printer connections for printing issues

## License
© 2024 Burger Bhau (Kothariya) - Product Sales Management System
