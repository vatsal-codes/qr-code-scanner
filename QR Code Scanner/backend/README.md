# QR Scanner Backend API

Backend API server for the Event QR Scanner application. Handles Google Sheets integration for QR code validation and scan tracking.

## 🚀 Features

- **Google Sheets Integration**: Real-time QR code validation against Google Sheets
- **Scan Tracking**: Automatic scan count tracking and updates
- **Row Highlighting**: Highlights validated entries in red on Google Sheets
- **RESTful API**: Clean API endpoints for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js 16+ and npm
- Google Cloud project with Sheets API enabled
- Google Service Account with JSON key file
- Google Sheet shared with service account

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd qr-scanner-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp config.example.env .env
# Edit .env with your Google Service Account credentials
```

4. **Configure Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Sheets API
   - Create a Service Account
   - Download JSON key file
   - Share your Google Sheet with the service account email

## 🔧 Configuration

Edit the `.env` file with your credentials:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
SHEET_ID=your-google-sheet-id
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## 🎯 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Google Sheets Operations
- `POST /api/initialize` - Initialize Google Sheets service
- `GET /api/sheet-data` - Get sheet data (debugging)
- `POST /api/validate-qr` - Validate QR code only
- `POST /api/process-scan` - Complete scan processing
- `POST /api/update-scan-count` - Update scan count
- `POST /api/highlight-row` - Highlight row in red

### Example Requests

**Process a QR scan:**
```bash
curl -X POST http://localhost:3001/api/process-scan \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "1001"}'
```

**Check health:**
```bash
curl http://localhost:3001/api/health
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📊 Google Sheets Setup

Your Google Sheet should have these columns:
- **Image** - QR code images
- **Enter total number of tickets needed (Kids above 8 - ticket required)** - Ticket count
- **Number** - QR code number (matches scanned data)
- **name** - Guest name
- **email** - Guest email
- **phone number** - Guest phone
- **Scans Used** - Auto-added for tracking

## 🔒 Security

- Environment variables are used for sensitive data
- `.env` file is excluded from version control
- CORS is configured for specific frontend URL
- Service account keys should be rotated regularly

## 📝 Error Messages

- `"QR code not found in records"` - Number not in sheet
- `"No QR Code exists, manual check needed if guest persists ticket bought"` - No image
- `"All QR Codes already used"` - Scan limit reached

## 🐛 Troubleshooting

### Common Issues

1. **"Method doesn't allow unregistered callers"**
   - Ensure Google Sheet is shared with service account email
   - Verify Google Sheets API is enabled

2. **Connection refused**
   - Check if server is running on correct port
   - Verify environment variables are set

3. **Invalid credentials**
   - Verify service account email and private key
   - Ensure private key includes `\n` characters

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | Yes |
| `GOOGLE_PRIVATE_KEY` | Private key from JSON file | Yes |
| `SHEET_ID` | Google Sheet ID | Yes |
| `PORT` | Server port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 🔗 Related

- [Frontend App](../qr-scanner-app/) - React frontend application
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)

## 📄 License

MIT License 