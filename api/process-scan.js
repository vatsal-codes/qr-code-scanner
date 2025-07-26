// Vercel Serverless Function - Process QR Scan
import { initializeGoogleSheets, SHEET_ID, enableCORS } from './_lib/googleSheets.js';

const validateQRCode = async (sheets, qrNumber) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:H',
    });

    const rows = response.data.values || [];
    const headerRow = rows[0] || [];
    
    const imageColIndex = headerRow.findIndex(col => col?.toLowerCase().includes('image'));
    const ticketsColIndex = headerRow.findIndex(col => col?.toLowerCase().includes('total number of tickets'));
    const numberColIndex = headerRow.findIndex(col => col?.toLowerCase().includes('number'));
    const nameColIndex = headerRow.findIndex(col => col?.toLowerCase().includes('name'));
    const scansUsedColIndex = headerRow.findIndex(col => col?.toLowerCase().includes('scans used'));

    const dataRows = rows.slice(1);
    const matchingRowIndex = dataRows.findIndex(row => row[numberColIndex] === qrNumber.toString());
    
    if (matchingRowIndex === -1) {
      return { valid: false, message: "QR code not found in records", errorType: "NOT_FOUND" };
    }

    const row = dataRows[matchingRowIndex];
    const actualRowIndex = matchingRowIndex + 2;

    const hasImage = row[imageColIndex] && row[imageColIndex].trim() !== '';
    if (!hasImage) {
      return { valid: false, message: "No QR Code exists, manual check needed if guest persists ticket bought", errorType: "NO_IMAGE" };
    }

    const totalTickets = parseInt(row[ticketsColIndex]) || 0;
    const scansUsed = parseInt(row[scansUsedColIndex]) || 0;

    if (scansUsed >= totalTickets) {
      return { valid: false, message: "All QR Codes already used", errorType: "LIMIT_EXCEEDED" };
    }

    return {
      valid: true,
      message: "QR Code valid - Entry granted!",
      guestName: row[nameColIndex] || 'Unknown',
      totalTickets,
      scansUsed,
      rowIndex: actualRowIndex
    };
  } catch (error) {
    return { valid: false, message: "Error validating QR code", errorType: "VALIDATION_ERROR" };
  }
};

export default async function handler(req, res) {
  if (enableCORS(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ error: 'QR code is required' });

    const { sheets } = await initializeGoogleSheets();
    const validation = await validateQRCode(sheets, qrCode);

    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    const newScanCount = validation.scansUsed + 1;
    
    // Update scan count
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!H${validation.rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[newScanCount.toString()]] }
    });

    // Highlight row if fully used
    if (newScanCount >= validation.totalTickets) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: { sheetId: 0, startRowIndex: validation.rowIndex - 1, endRowIndex: validation.rowIndex, startColumnIndex: 0, endColumnIndex: 8 },
              cell: { userEnteredFormat: { backgroundColor: { red: 1.0, green: 0.0, blue: 0.0, alpha: 0.3 } } },
              fields: 'userEnteredFormat.backgroundColor'
            }
          }]
        }
      });
    }

    return res.status(200).json({
      valid: true,
      message: validation.message,
      guestName: validation.guestName,
      scanCount: newScanCount,
      totalTickets: validation.totalTickets,
      isFullyUsed: newScanCount >= validation.totalTickets
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
