// Shared Google Sheets utility for Vercel serverless functions
import { google } from 'googleapis';

export const initializeGoogleSheets = async () => {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Service Account credentials');
  }
  
  const auth = new google.auth.JWT(
    serviceAccountEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  
  const sheets = google.sheets({ version: 'v4', auth });
  return { auth, sheets };
};

export const SHEET_ID = process.env.SHEET_ID || '14T6NYrCbMgOcyCktq3PK1W7wJWoGSM_9O6eMzTRmX2Q';

export const enableCORS = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};
