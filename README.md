# POS System - Fast Food Shop

A production-grade offline POS system for fast-food shops selling cold drinks, paan, and miscellaneous products.

## 🚀 Features

- **Offline Operation**: Works completely without internet
- **SQLite Database**: Modern, reliable database storage
- **Auto-Generated IDs**: Automatic product ID generation
- **Thermal Printing**: Bill printing support
- **Daily Reports**: Excel and CSV export
- **REST APIs**: Clean backend APIs
- **React Frontend**: Modern web interface with premium UI
- **Product Management**: Add, edit, deactivate products
- **Real-time Updates**: Live inventory and sales tracking

## 📋 System Requirements

- **Python 3.8+** (with pip)
- **Node.js 14+** (with npm)
- **Windows OS** (for .bat files)
- **4GB+ RAM** recommended
- **500MB+ disk space**

## 🛠️ Installation & Setup

### Method 1: Automatic Setup (Recommended)

1. **Clone or download** this project
2. **Run the setup script**:
   ```bash
   first_time_start.bat
   ```
3. **Follow the on-screen instructions**

The setup script will:
- ✅ Check Python and Node.js installation
- ✅ Install all backend dependencies
- ✅ Initialize SQLite database
- ✅ Migrate existing XML data (if found)
- ✅ Install frontend dependencies
- ✅ Create sample data if needed

### Method 2: Manual Setup

1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python init_db.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

## 🚀 Running the Application

### Quick Start

1. **Run the startup script**:
   ```bash
   start.bat
   ```
2. **Open your browser** and go to: http://localhost:3000

### Manual Start

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Database Migration

The system automatically migrates from XML to SQLite:

- **XML Data**: Automatically imported from `backend/data/products.xml`
- **Sample Data**: Created if no XML data found
- **Backup**: Original XML file preserved

## 🎯 Usage Guide

### First Steps

1. **Add Products**: Go to Product Management → Add New Product
2. **Test Billing**: Create a test bill with sample products
3. **Check Reports**: View daily sales and analytics

### Product Management

- **Add Products**: Auto-generated IDs (e.g., COLD123, PAAN456)
- **Edit Products**: Update prices, names, categories
- **Deactivate**: Hide products from POS without deleting data

### Categories

- **Cold Drinks**: Beverages, soft drinks
- **Paan**: Traditional paan items
- **Others**: Miscellaneous items

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all active products
- `GET /api/products?include_inactive=true` - Get all products including inactive
- `POST /api/products` - Create new product
- `PUT /api/products/<id>` - Update product
- `GET /api/products/<id>` - Get specific product

### Billing
- `POST /api/bill/create` - Create new bill
- `GET /api/bill/<no>` - Get specific bill
- `GET /api/bill/today` - Get today's bills

### Summary & Reports
- `GET /api/summary/today` - Get today's summary
- `GET /api/reports/excel/today` - Export Excel report
- `GET /api/reports/csv/today` - Export CSV report

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── app.py                 # Flask application
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── init_db.py            # Database initialization
│   ├── routes/                # API routes
│   │   ├── products.py        # Product management
│   │   ├── billing.py         # Billing operations
│   │   ├── summary.py         # Sales summary
│   │   └── reports.py         # Report generation
│   ├── services/              # Business logic
│   │   ├── sqlite_db_service.py # SQLite database service
│   │   ├── excel_service.py   # Excel export
│   │   └── printer_service.py # Thermal printing
│   └── data/                  # SQLite database
│       └── products.db        # Main database file
├── frontend/
│   ├── package.json           # Node dependencies
│   ├── public/                # Static assets
│   └── src/                   # React source
│       ├── components/        # React components
│       ├── screens/           # Main screens
│       └── utils/             # Utilities
├── start.bat                  # Daily startup script
├── first_time_start.bat       # First-time setup
└── README.md                  # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **Python not found**: Install Python 3.8+ and add to PATH
2. **Node.js not found**: Install Node.js LTS version
3. **Port already in use**: Close other applications using ports 3000/5000
4. **Database errors**: Delete `data/products.db` and run `init_db.py`

### Getting Help

- **Check logs**: Backend console shows detailed error messages
- **Browser console**: Press F12 for frontend debugging
- **Database**: Check `data/products.db` file exists

## 🔄 Updates & Maintenance

### Backup Data
- **Database**: Copy `backend/data/products.db`
- **Configuration**: Backup custom settings

### Updates
1. **Backup current data**
2. **Pull latest code**
3. **Run setup script** if dependencies changed
4. **Test functionality**

## 📄 License

MIT License - Free for commercial and personal use

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review error logs
- Verify system requirements

---

**🎉 Enjoy your POS System!**
