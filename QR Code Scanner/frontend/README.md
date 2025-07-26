# Event QR Scanner App

A mobile-optimized web application for scanning QR codes and validating event tickets through Google Sheets integration. Perfect for event managers to grant entry to attendees.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with camera access
- 📊 **Google Sheets Integration**: Real-time validation against your event database
- 🎟️ **Ticket Tracking**: Tracks multiple scans per ticket based on quantity purchased
- 📋 **Scan History**: Complete history of all scanned QR codes with timestamps
- ✅ **Real-time Validation**: Instant feedback for valid/invalid QR codes
- 🔴 **Row Highlighting**: Automatically highlights validated entries in red on Google Sheets
- 📈 **Analytics**: Success rate tracking and scan statistics

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Cloud account with Sheets API enabled
- Google Sheet with your event data

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd qr-scanner-app
npm install
```

2. **Set up Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create a Service Account:
     - Go to "Credentials" → "Create Credentials" → "Service Account"
     - Name it something like "qr-scanner-service"
     - Download the JSON key file
   - Share your Google Sheet with the service account email (found in the JSON file)

3. **Configure credentials:**
   - Open `src/config/googleConfig.js`
   - Replace `SERVICE_ACCOUNT_EMAIL` with your service account email
   - Replace `PRIVATE_KEY` with your private key from the JSON file
   - Update `SHEET_ID` if different from the default

4. **Start development server:**
```bash
npm run dev
```

## Google Sheets Setup

Your Google Sheet should have these exact column names:

- **Image**: QR code images (can be empty, but existence is checked)
- **Enter total number of tickets needed (Kids above 8 - ticket required)**: Number of allowed scans
- **Number**: The number encoded in the QR code (matches QR data)
- **name**: Guest name (optional, for display)
- **email**: Guest email (optional)
- **phone number**: Guest phone (optional)

The app will automatically add a **Scans Used** column to track scan counts.

### Example Sheet Structure:
| Image | Enter total number of tickets needed... | Number | name | email | phone number | Scans Used |
|-------|----------------------------------------|---------|------|-------|--------------|------------|
| [QR] | 2 | 1001 | John Doe | john@email.com | 555-0123 | 0 |
| [QR] | 1 | 1002 | Jane Smith | jane@email.com | 555-0124 | 0 |

## QR Code Validation Logic

1. **QR Code Found**: Checks if the number exists in the "Number" column
2. **Image Check**: Verifies that the "Image" column is not empty
3. **Scan Limit**: Compares current scans vs. total tickets purchased
4. **Valid Scan**: Increments scan count and highlights row in red
5. **Invalid Scenarios**:
   - QR code not found → "QR code not found in records"
   - No image → "No QR Code exists, manual check needed if guest persists ticket bought"
   - All scans used → "All QR Codes already used"

## Error Messages

| Scenario | Message |
|----------|---------|
| Valid scan | "QR Code valid - Entry granted!" |
| QR not found | "QR code not found in records" |
| No QR image | "No QR Code exists, manual check needed if guest persists ticket bought" |
| All scans used | "All QR Codes already used" |

## Usage

1. **Open the app** on a mobile device
2. **Grant camera permissions** when prompted
3. **Tap "Start Scanning"** to begin
4. **Position QR code** within the blue overlay
5. **View results** instantly with success/error messages
6. **Check scan history** below for all previous scans

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
npm run build
# Push dist folder to gh-pages branch
```

## Mobile Optimization

- **Camera Access**: Uses device's back camera for better QR scanning
- **Responsive Design**: Optimized for various mobile screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Performance**: Lightweight and fast loading
- **PWA Ready**: Can be installed as a mobile app

## Troubleshooting

### Camera Issues
- Ensure HTTPS for camera access (required by browsers)
- Check camera permissions in browser settings
- Try refreshing the page if camera doesn't start

### Google Sheets Issues
- Verify service account has access to your sheet
- Check that the sheet ID is correct
- Ensure the Google Sheets API is enabled
- Verify column names match exactly

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)

## Development

### Tech Stack
- **React 18** with Hooks
- **Vite** for fast development and building  
- **Tailwind CSS** for styling
- **@zxing/library** for QR code scanning
- **Google Sheets API v4** for data integration

### Project Structure
```
src/
├── components/
│   ├── QRScanner.jsx       # Camera and QR scanning logic
│   └── ScanHistory.jsx     # Scan history display
├── services/
│   └── googleSheets.js     # Google Sheets API integration
├── config/
│   └── googleConfig.js     # Service account configuration
├── App.jsx                 # Main application component
└── main.jsx               # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security Notes

- Never commit service account credentials to version control
- Use environment variables for production deployments
- Regularly rotate service account keys
- Limit service account permissions to only Google Sheets

## License

MIT License - feel free to use for your events!

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your Google Sheets setup
3. Test with a simple QR code first
4. Check browser console for detailed error messages

---

**Happy Scanning! 📱✨**
