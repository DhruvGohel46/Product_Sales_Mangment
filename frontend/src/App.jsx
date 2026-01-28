import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>POS System - Fast Food Shop</h1>
        <p>Backend API Integration Ready</p>
        <div>
          <h2>Available Endpoints:</h2>
          <ul>
            <li>Products: /api/products</li>
            <li>Billing: /api/bill</li>
            <li>Summary: /api/summary</li>
            <li>Reports: /api/reports</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
