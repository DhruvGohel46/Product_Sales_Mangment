# POS System - Fast Food Shop

A production-grade offline POS system for fast-food shops selling cold drinks, paan, and miscellaneous products.

## Features

- **Offline Operation**: Works completely without internet
- **XML Storage**: Lightweight XML-based database
- **Thermal Printing**: Bill printing support
- **Daily Reports**: Excel and XML export
- **REST APIs**: Clean backend APIs
- **React Frontend**: Modern web interface

## Quick Start

### First Time Setup

1. Run `first_time_start.bat` to install all dependencies
2. Follow the setup instructions

### Daily Usage

1. Run `start.bat` to launch both backend and frontend
2. Backend: http://localhost:5000
3. Frontend: http://localhost:3000

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/<id>` - Update product

### Billing
- `POST /api/bill/create` - Create new bill
- `GET /api/bill/<no>` - Get specific bill
- `GET /api/bill/today` - Get today's bills

### Summary
- `GET /api/summary/today` - Get today's summary
- `GET /api/summary/quick-stats` - Quick dashboard stats

### Reports
- `GET /api/reports/excel/today` - Export Excel report
- `GET /api/reports/xml/today` - Export XML data

## Data Structure

### Products XML
```xml
<products>
  <product id="COLA001">
    <name>Coca Cola</name>
    <price>25.0</price>
    <category>coldrink</category>
    <active>true</active>
  </product>
</products>
```

### Bills XML (Daily)
```xml
<bills date="2026-01-28">
  <bill no="1">
    <date>2026-01-28</date>
    <time>10:30:15</time>
    <products>...</products>
    <total>60.0</total>
  </bill>
</bills>
```

## Folder Structure

```
project-root/
├── backend/
│   ├── app.py                 # Flask application
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── data/                  # XML storage
├── frontend/
│   ├── package.json           # Node dependencies
│   └── src/                   # React source
├── start.bat                  # Daily startup script
└── first_time_start.bat       # First-time setup
```

## Requirements

- Python 3.7+
- Node.js 14+
- Windows OS (for .bat files)

## License

MIT License
