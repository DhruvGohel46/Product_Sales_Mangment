import React from 'react';

const Placeholder = ({ title, description }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{title || 'Page Placeholder'}</h2>
      <p>{description || 'This page is under construction. UI will be implemented later.'}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Note:</strong> Backend APIs are ready for integration.</p>
        <p>Available API endpoints:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Products: GET/POST/PUT /api/products</li>
          <li>Billing: POST /api/bill/create, GET /api/bill/:id</li>
          <li>Summary: GET /api/summary/today</li>
          <li>Reports: GET /api/reports/excel/today, GET /api/reports/xml/today</li>
        </ul>
      </div>
    </div>
  );
};

export default Placeholder;
