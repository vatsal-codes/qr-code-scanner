// Vercel Serverless Function - Initialize Google Sheets Service
import { initializeGoogleSheets, SHEET_ID, enableCORS } from './_lib/googleSheets.js';

export default async function handler(req, res) {
  if (enableCORS(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sheets } = await initializeGoogleSheets();
    
    // Verify access
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:A1',
    });

    // Check if "Scans Used" column exists
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!1:1',
    });

    const headers = headerResponse.data.values?.[0] || [];
    const scansUsedExists = headers.some(header => header?.toLowerCase().includes('scans used'));

    if (!scansUsedExists) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!H1',
        valueInputOption: 'RAW',
        requestBody: { values: [['Scans Used']] }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Google Sheets service initialized successfully',
      sheetId: SHEET_ID,
      scansUsedColumnAdded: !scansUsedExists
    });

  } catch (error) {
    if (error.message.includes('does not have permission')) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: 'Make sure to share your Google Sheet with the service account email'
      });
    }
    return res.status(500).json({ success: false, error: 'Initialization failed', message: error.message });
  }
}
