// Google Sheets Configuration
// Replace these with your actual service account credentials

export const GOOGLE_CONFIG = {
  SHEET_ID: '14T6NYrCbMgOcyCktq3PK1W7wJWoGSM_9O6eMzTRmX2Q',
  
  // Service Account Email
  // Get this from your Google Cloud Console > Service Accounts
  SERVICE_ACCOUNT_EMAIL: 'your-service-account@your-project.iam.gserviceaccount.com',
  
  // Private Key
  // Get this from your service account JSON key file
  // Replace \n with actual newlines or keep as \n and the code will handle it
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----`,
};

// Instructions for setting up Google Service Account:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing one
// 3. Enable Google Sheets API
// 4. Go to "Credentials" > "Create Credentials" > "Service Account"
// 5. Create a service account with a name like "qr-scanner-service"
// 6. Download the JSON key file
// 7. Share your Google Sheet with the service account email
// 8. Replace the values above with your actual credentials 