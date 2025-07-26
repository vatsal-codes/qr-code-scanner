# 📱 QR Code Scanner App

A complete QR code scanner solution for event management with Google Sheets integration. Scan QR codes, validate tickets, and track attendance in real-time.

## 🚀 Features

- **📱 Mobile-First QR Scanner**: Real-time camera-based QR code scanning optimized for mobile devices
- **📊 Google Sheets Integration**: Validate QR codes against your event database in real-time
- **🎟️ Smart Ticket Tracking**: Handle multiple tickets per guest with automatic scan count tracking
- **🔴 Visual Feedback**: Highlights validated entries in red on Google Sheets
- **📋 Scan History**: Complete audit trail with timestamps and guest information
- **⚡ Real-time Updates**: Instant validation and database updates
- **🛡️ Secure Backend**: JWT-based authentication with Google Service Account

## 🏗️ Architecture

```
QR-Code-Scanner/
├── frontend/          # React + Vite mobile app
│   ├── src/
│   │   ├── components/    # QR Scanner, History components
│   │   ├── services/      # API integration services
│   │   └── ...
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── services/          # Google Sheets integration
│   ├── server.js         # Main API server
│   └── package.json
└── README.md         # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 16+ and npm
- Google Cloud account with Sheets API enabled
- Google Service Account with JSON key file

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/qr-code-scanner.git
cd qr-code-scanner

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Google Sheets
1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Sheets API
   - Create a Service Account
   - Download JSON key file

2. **Set up Backend Environment**:
```bash
cd backend
cp config.example.env .env
# Edit .env with your Google Service Account credentials
```

3. **Share Google Sheet**:
   - Share your Google Sheet with the service account email
   - Set permission to "Editor"

### 3. Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm start
# Backend runs on http://localhost:3001
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📊 Google Sheets Setup

Your Google Sheet should have these **exact column names**:

| Column Name | Description |
|-------------|-------------|
| **Image** | QR code images (existence checked) |
| **Enter total number of tickets needed (Kids above 8 - ticket required)** | Number of allowed scans |
| **Number** | QR code number (matches scanned data) |
| **name** | Guest name (optional) |
| **email** | Guest email (optional) |
| **phone number** | Guest phone (optional) |
| **Scans Used** | Auto-added for tracking |

### Example Data:
| Image | Enter total... | Number | name | email | Scans Used |
|-------|---------------|---------|------|-------|------------|
| [QR] | 2 | 1001 | John Doe | john@email.com | 0 |
| [QR] | 1 | 1002 | Jane Smith | jane@email.com | 0 |

## 🎯 API Endpoints

### Health & Status
- `GET /api/health` - Server health check
- `POST /api/initialize` - Initialize Google Sheets service

### QR Code Operations
- `POST /api/validate-qr` - Validate QR code only
- `POST /api/process-scan` - Complete scan processing (validate + update + highlight)
- `GET /api/sheet-data` - Get sheet data (debugging)

### Manual Operations
- `POST /api/update-scan-count` - Update scan count
- `POST /api/highlight-row` - Highlight row in red

## 🔧 Configuration

### Backend Environment Variables
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
SHEET_ID=your-google-sheet-id
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 📱 Usage

1. **Open the app** on a mobile device: `http://localhost:5173`
2. **Grant camera permissions** when prompted
3. **Start scanning** QR codes
4. **View results** instantly with success/error feedback
5. **Check scan history** for audit trail

## 🚀 Deployment

### Backend Deployment Options
- **Railway**: `railway login && railway deploy`
- **Render**: Connect GitHub repo, deploy backend folder
- **Heroku**: `heroku create && git push heroku main`

### Frontend Deployment Options  
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=frontend/dist`
- **GitHub Pages**: Push `frontend/dist` to gh-pages branch

## 🔒 Security Features

- **Environment variables** for sensitive data
- **CORS protection** configured for specific origins
- **Service account authentication** (no API keys in frontend)
- **Request validation** and error handling
- **Secure credential storage** (`.env` excluded from git)

## 📝 Error Messages

| Scenario | Message |
|----------|---------|
| ✅ Valid scan | "QR Code valid - Entry granted!" |
| ❌ Not found | "QR code not found in records" |
| ❌ No image | "No QR Code exists, manual check needed if guest persists ticket bought" |
| ❌ All used | "All QR Codes already used" |

## 🧪 Testing

### Test QR Codes (with mock service)
- `1001` - John Doe (2 tickets) ✅ Valid
- `1002` - Jane Smith (1 ticket) ✅ Valid  
- `1003` - Bob Johnson (1 remaining) ✅ Valid
- `1004` - Alice Brown (No image) ❌ Invalid
- `9999` - Not found ❌ Invalid

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Process scan
curl -X POST http://localhost:3001/api/process-scan \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "1001"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **"Method doesn't allow unregistered callers"**
   - ✅ Share Google Sheet with service account email
   - ✅ Verify Google Sheets API is enabled

2. **Camera not working**
   - ✅ Use HTTPS (required for camera access)
   - ✅ Grant camera permissions in browser
   - ✅ Use mobile device (better camera support)

3. **Backend connection failed**
   - ✅ Check backend is running on port 3001
   - ✅ Verify CORS settings
   - ✅ Check environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📄 License

MIT License - feel free to use for your events!

## 🎉 Credits

Built with:
- **Frontend**: React, Vite, Tailwind CSS, @zxing/library
- **Backend**: Node.js, Express, Google Sheets API
- **Deployment**: Vercel, Railway, Render

---

**Happy Scanning! 📱✨**

For questions or support, check the troubleshooting section or create an issue. 