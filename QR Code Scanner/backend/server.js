const express = require('express');
const cors = require('cors');
require('dotenv').config();

const googleSheetsService = require('./services/googleSheets');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QR Scanner Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize Google Sheets service
app.post('/api/initialize', async (req, res) => {
  try {
    await googleSheetsService.initialize();
    await googleSheetsService.addScansUsedColumn();
    
    res.json({ 
      success: true, 
      message: 'Google Sheets service initialized successfully' 
    });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize Google Sheets service',
      details: error.message 
    });
  }
});

// Get sheet data (for debugging)
app.get('/api/sheet-data', async (req, res) => {
  try {
    const data = await googleSheetsService.getSheetData();
    res.json({ 
      success: true, 
      data: data.data,
      headers: data.headers,
      count: data.data.length
    });
  } catch (error) {
    console.error('Get sheet data error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sheet data',
      details: error.message 
    });
  }
});

// Validate QR code
app.post('/api/validate-qr', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code is required'
      });
    }

    console.log(`Validating QR code: ${qrCode}`);
    
    const result = await googleSheetsService.validateQRCode(qrCode);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate QR code',
      details: error.message
    });
  }
});

// Process valid scan (validate + update)
app.post('/api/process-scan', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code is required'
      });
    }

    console.log(`Processing scan for QR code: ${qrCode}`);
    
    const result = await googleSheetsService.processValidScan(qrCode);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Process scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process scan',
      details: error.message
    });
  }
});

// Update scan count manually
app.post('/api/update-scan-count', async (req, res) => {
  try {
    const { rowIndex, scanCount } = req.body;
    
    if (!rowIndex || scanCount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Row index and scan count are required'
      });
    }

    await googleSheetsService.updateScanCount(rowIndex, scanCount);
    
    res.json({
      success: true,
      message: `Updated scan count for row ${rowIndex} to ${scanCount}`
    });
    
  } catch (error) {
    console.error('Update scan count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scan count',
      details: error.message
    });
  }
});

// Highlight row manually
app.post('/api/highlight-row', async (req, res) => {
  try {
    const { rowIndex } = req.body;
    
    if (!rowIndex) {
      return res.status(400).json({
        success: false,
        error: 'Row index is required'
      });
    }

    await googleSheetsService.highlightRow(rowIndex);
    
    res.json({
      success: true,
      message: `Highlighted row ${rowIndex}`
    });
    
  } catch (error) {
    console.error('Highlight row error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to highlight row',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QR Scanner Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

module.exports = app; 