# Production Setup Guide

## Current Status: Development Mode

The app is currently running with a **mock Google Sheets service** to demonstrate functionality. For production use, you need to implement the real Google Sheets API integration.

## Why Mock Service?

The Google Sheets API library (`googleapis`) is designed for Node.js server environments and cannot run directly in browsers due to:
- Node.js-specific modules (fs, crypto, stream, etc.)
- CORS restrictions
- Security concerns with service account keys in frontend code

## Production Implementation Options

### Option 1: Backend API (Recommended)

Create a backend API server that handles Google Sheets integration:

#### Backend Setup (Node.js/Express)

1. **Create backend service:**
```bash
mkdir qr-scanner-backend
cd qr-scanner-backend
npm init -y
npm install express googleapis cors dotenv
```

2. **Create `server.js`:**
```javascript
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const sheets = google.sheets('v4');
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Validate QR code endpoint
app.post('/api/validate-qr', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Get sheet data
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: process.env.SHEET_ID,
      range: 'Sheet1!A:Z',
    });
    
    // Process validation logic (same as current mock)
    // ... validation code here ...
    
    res.json({ valid: true, message: 'QR Code valid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

3. **Create `.env` file:**
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
SHEET_ID=14T6NYrCbMgOcyCktq3PK1W7wJWoGSM_9O6eMzTRmX2Q
```

#### Frontend Update

4. **Create new service file `src/services/apiGoogleSheets.js`:**
```javascript
const API_BASE_URL = 'http://localhost:3001'; // or your deployed backend URL

class ApiGoogleSheetsService {
  async processValidScan(qrCode) {
    const response = await fetch(`${API_BASE_URL}/api/validate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrCode }),
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return response.json();
  }
  
  // Implement other methods...
}

export default new ApiGoogleSheetsService();
```

5. **Update `src/App.jsx`:**
```javascript
// Change import from mock to API service
import googleSheetsService from './services/apiGoogleSheets';
```

### Option 2: Serverless Functions

Use Vercel, Netlify, or Firebase functions:

#### Vercel Functions

1. **Create `api/validate-qr.js`:**
```javascript
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Same logic as backend server
  // ... validation code here ...
}
```

2. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

### Option 3: Google Apps Script (Alternative)

Create a Google Apps Script web app that acts as an API:

1. **Go to script.google.com**
2. **Create new project**
3. **Add this code:**
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const qrCode = data.qrCode;
  
  // Access your sheet directly
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  
  // Validation logic here...
  
  return ContentService
    .createTextOutput(JSON.stringify({ valid: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy as web app with public access**
5. **Update frontend to use the Apps Script URL**

## Security Considerations

### For Backend/Serverless:
- Store service account credentials as environment variables
- Enable CORS only for your frontend domain
- Implement rate limiting
- Add request validation
- Use HTTPS in production

### For Apps Script:
- Set proper sharing permissions
- Validate requests
- Log access attempts

## Deployment Steps

1. **Choose implementation option** (Backend API recommended)
2. **Set up service account** (if not done already):
   - Go to Google Cloud Console
   - Enable Sheets API
   - Create service account
   - Download JSON key
   - Share your sheet with service account email
3. **Deploy backend** (Heroku, Railway, DigitalOcean, etc.)
4. **Update frontend** to use production API
5. **Deploy frontend** (Vercel, Netlify, etc.)

## Environment Variables for Production

### Backend:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
SHEET_ID=14T6NYrCbMgOcyCktq3PK1W7wJWoGSM_9O6eMzTRmX2Q
PORT=3001
```

### Frontend:
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Testing the Integration

1. **Start with mock data** (current setup)
2. **Test QR scanning** with test codes (1001, 1002, 1003, 1004)
3. **Implement backend API**
4. **Test API endpoints** with Postman/curl
5. **Connect frontend to backend**
6. **Test end-to-end flow**
7. **Deploy to production**

## Current Test QR Codes

The mock service includes these test QR codes:
- `1001` - John Doe (2 tickets, 0 used) ✅ Valid
- `1002` - Jane Smith (1 ticket, 0 used) ✅ Valid  
- `1003` - Bob Johnson (3 tickets, 2 used) ✅ Valid (1 scan remaining)
- `1004` - Alice Brown (No QR image) ❌ Invalid
- `9999` - Not in records ❌ Invalid

## Next Steps

1. **Test the current app** with mock data
2. **Choose your production implementation**
3. **Set up Google Cloud service account**
4. **Implement backend API**
5. **Deploy and test**

Need help with any of these steps? The current mock implementation shows exactly how the real API should work! 