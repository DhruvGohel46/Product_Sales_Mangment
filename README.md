# InfoBill - Modern POS & Billing System

A production-grade offline POS and billing system for retail shops, cafes, and small businesses.

## 🚀 Features

### Core Functionality
- **Offline Operation**: Works completely without internet
- **SQLite Database**: Modern, reliable database storage with automatic backups
- **Auto-Generated IDs**: Automatic product ID generation (e.g., COLD123)
- **Thermal Printing**: Seamless integration with varied POS printers
- **Daily Reports**: Comprehensive Excel and CSV exports with business headers

### User Interface & Experience
- **Glassmorphic Design**: Modern, translucent UI with blur effects
- **Responsive Layout**: Optimized sidebar navigation and header
- **Global Scrolling**: Smooth scrolling across Analytics, Management, and Settings
- **Dedicated Billing View**: Full-height, independent scrolling for billing operations

### Advanced Billing Logic
- **Daily Resets**: Bill numbers automatically reset to 1 each day
- **Real-time Refresh**: Daily sales data auto-refreshes at midnight
- **Live Inventory**: Instant updates to stock levels upon billing

### Desktop Integration (Electron)
- **Native Experience**: Runs as a standalone Windows application
- **System Tray**: Minimized operation for background processing
- **Auto-Update**: Built-in mechanism for seamless updates

## 💻 Application Tour & Usage Guide

### 1. Billing Terminal (POS)
The heart of your operations, designed for speed and efficiency.

**Key Tasks:**
- **Create a Bill**: 
  - Click on product cards in the grid OR use the search bar to find items.
  - Adjust quantities using the `+` / `-` buttons.
- **Checkout**:
  - Review the "Current Bill" section on the right.
  - Select Payment Mode (Cash/Online).
  - Click **"Print Bill"** (or press `Enter`) to finalize and print.
- **New Customer**:
  - Click **"Start New Bill"** (or press `F5`) to clear the screen for the next customer.

### 2. Analytics Dashboard
Track your business growth with visual reports.

**Key Tasks:**
- **View Daily Stats**: The default view shows today's Total Sales, Bill Count, and Average Order Value.
- **Analyze Trends**: Use the graphs to identify peak hours and best-selling categories.
- **Export Data**:
  - Click **"Export to Excel"** for a detailed spreadsheet compatible with accounting software.
  - Click **"Export to CSV"** for a raw data file.

### 3. Product Management
Control your inventory and pricing.

**Key Tasks:**
- **Add Product**:
  - Click the **"Add Product"** button.
  - Enter Name, Price, and select a Category.
  - *Note: ID is auto-generated.*
- **Edit Product**:
  - Click the **Pencil Icon** on any product row.
  - Update details and click **"Save"**.
- **Remove Product**:
  - Toggle the **"Active"** switch to hide a product from the billing screen without deleting history.

### 4. Settings & Configuration
Customize the application for your shop.

**Key Tasks:**
- **Shop Profile**: Enter your Shop Name and Address. These appear on every printed bill.
- **Printer Configuration**: Select your thermal printer driver and set the paper width (58mm/80mm).
- **Theme**: Toggle "Dark Mode" for low-light environments.

## �📋 System Requirements

- **OS**: Windows 10/11 (Preferred for Desktop App)
- **Runtime**: Node.js 16+ & Python 3.8+
- **Memory**: 4GB+ RAM recommended
- **Storage**: 500MB+ disk space

## 🛠️ Installation & Setup

### Method 1: Desktop App (Recommended)
1. **Download** the latest installer (`.exe`)
2. **Run** the installer and follow prompts
3. **Launch** from Desktop shortcut

### Method 2: Source Code Setup
1. **Clone Repository**:
   ```bash
   git clone https://github.com/DhruvGohel46/InfoBill.git
   ```
2. **Run Setup Script**:
   ```bash
   first_time_start.bat
   ```
   *This manages all dependencies for both backend and frontend.*

## 🚀 Running the Application

### Option A: Quick Start (Batch Script)
1. **Double-click**: `Product_Sales_Start.bat`
2. **Access**: Opens automatically in your default browser at http://localhost:3050

### Option B: Electron Development
To run the application in Electron mode during development:
```bash
npm run electron-dev
```

### Option C: Manual Start (Terminal)
1. **Backend**:
   ```bash
   cd backend
   python app.py
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm start
   ```

## 📊 Database & Reports
- **Automatic Migration**: XML data is automatically migrated to SQLite on first run.
- **Daily Refresh**: The system auto-archives previous day's data and resets for a fresh start.
- **Excel Reports**: Generated with "InfoBill" branding and restaurant details.

## 📁 Project Structure

```
infobill/
├── electron/
│   ├── main.js                # Electron main process
│   ├── preload.js             # Secure IPC bridge
│   └── assets/                # Icons and build resources
├── backend/
│   ├── app.py                 # Flask application entry
│   ├── routes/
│   │   ├── products.py        # Item management
│   │   ├── billing.py         # Transaction processing
│   │   ├── reports.py         # Excel/CSV generation
│   │   ├── categories.py      # Category management
│   │   └── settings.py        # App configuration
│   ├── services/
│   │   ├── sqlite_db_service.py # Database interactions
│   │   └── printer_service.py # Hardware integration
│   └── data/                  # SQLite storage (products.db)
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Main views (Billing, Management, etc.)
│   │   └── utils/             # Helper functions
│   └── public/                # Static assets
├── Product_Sales_Start.bat    # Daily launcher
├── first_time_start.bat       # Dependency installer
└── README.md                  # Documentation
```

## ⌨️ Keyboard Shortcuts

Speed up your workflow with these hotkeys:

| Action | Shortcut | Scope |
|--------|----------|-------|
| **Start New Bill** | `F5` | Billing Screen |
| **Print Bill** | `Enter` | Billing Modal |
| **Search Products** | `Ctrl + F` (Browser Default) | All Screens |
| **Toggle Fullscreen** | `F11` | Application |
| **Reload App** | `Ctrl + R` | Application |
| **Open Dev Tools** | `Ctrl + Shift + I` | Electron Mode |

## 🛠️ Advanced Configuration

### Printer Customization
You can fine-tune print settings in `backend/services/printer_service.py`:
- **Paper Width**: Default is `58mm`. Change `PAPER_WIDTH` constant for 80mm printers.
- **Character Set**: Default is `PC437` for international support.

### Network Settings
To allow other devices to access the POS:
1. Open `backend/app.py`.
2. Change `host='127.0.0.1'` to `host='0.0.0.0'`.
3. Open `frontend/package.json`.
4. Update proxy settings if running in dev mode.

## 👨‍💻 Developer Guide

### Tech Stack
- **Frontend**: React.js, Framer Motion (Animations), Axios (API).
- **Backend**: Flask (Python), SQLite (Database), SQLAlchemy (ORM).
- **Desktop**: Electron.js (Wrapper).

### Key Files
- `frontend/src/App.jsx`: Main routing and layout logic.
- `backend/routes/billing.py`: Core logic for bill creation and printing.
- `backend/data/products.db`: SQLite database file (auto-created).

### Adding a New Feature
1. **Backend**: Add a new route in `backend/routes/`.
2. **Frontend**: Create a component in `frontend/src/components/`.
3. **Link**: Register the route in `app.py` and the component in `App.jsx`.

## ❓ FAQ & Troubleshooting

### Q: The printer is not printing?
- **A**: Ensure the thermal printer is connected via USB and drivers are installed. The system uses the default system printer or a specific USB endpoint. Check `printer_service.py` logs.

### Q: How do I reset the database?
- **A**: Delete the `backend/data/products.db` file. Restart the backend to auto-generate a fresh database.

### Q: Can I run this on multiple computers?
- **A**: Yes, but they must be on the same WiFi network. Set the backend host to `0.0.0.0` and access via the host's IP address.

### Q: Images are not showing?
- **A**: Ensure images are placed in `backend/static/images` and filenames match the database records.

## 🤝 Support
For detailed issues, please check the [GitHub Issues](https://github.com/DhruvGohel46/Product_Sales_Mangment/issues) page.

## 📄 License
MIT License - Open source and free to use.

---

**🎉 Enjoy InfoBill - Your Modern Billing Solution!**
