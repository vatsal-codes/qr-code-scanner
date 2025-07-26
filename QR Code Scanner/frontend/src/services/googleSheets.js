import { google } from 'googleapis';
import { GOOGLE_CONFIG } from '../config/googleConfig.js';

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create JWT auth client
      this.auth = new google.auth.JWT(
        GOOGLE_CONFIG.SERVICE_ACCOUNT_EMAIL,
        null,
        GOOGLE_CONFIG.PRIVATE_KEY.replace(/\\n/g, '\n'),
        [
          'https://www.googleapis.com/auth/spreadsheets'
        ]
      );

      // Initialize the sheets API
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      
      console.log('Google Sheets API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
      throw error;
    }
  }

  async getSheetData() {
    await this.initialize();
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        range: 'Sheet1!A:Z', // Get all data
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found in sheet');
      }

      // Parse the data into a more usable format
      const headers = rows[0];
      const data = [];

      for (let i = 1; i < rows.length; i++) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = rows[i][index] || '';
        });
        row.rowIndex = i + 1; // Store the actual row number (1-based)
        data.push(row);
      }

      return { headers, data };
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }

  async addScansUsedColumn() {
    await this.initialize();
    
    try {
      // First, get current headers to see if 'Scans Used' column already exists
      const { headers } = await this.getSheetData();
      
      if (headers.includes('Scans Used')) {
        console.log('Scans Used column already exists');
        return headers.indexOf('Scans Used');
      }

      // Add 'Scans Used' header to the first empty column
      const columnIndex = headers.length;
      const columnLetter = this.numberToColumnLetter(columnIndex + 1);
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        range: `Sheet1!${columnLetter}1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Scans Used']]
        }
      });

      console.log(`Added 'Scans Used' column at ${columnLetter}`);
      return columnIndex;
    } catch (error) {
      console.error('Error adding Scans Used column:', error);
      throw error;
    }
  }

  async updateScanCount(rowIndex, newScanCount) {
    await this.initialize();
    
    try {
      const { headers } = await this.getSheetData();
      const scansUsedIndex = headers.indexOf('Scans Used');
      
      if (scansUsedIndex === -1) {
        throw new Error('Scans Used column not found');
      }

      const columnLetter = this.numberToColumnLetter(scansUsedIndex + 1);
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        range: `Sheet1!${columnLetter}${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[newScanCount]]
        }
      });

      console.log(`Updated scan count for row ${rowIndex} to ${newScanCount}`);
    } catch (error) {
      console.error('Error updating scan count:', error);
      throw error;
    }
  }

  async highlightRow(rowIndex) {
    await this.initialize();
    
    try {
      const requests = [{
        repeatCell: {
          range: {
            sheetId: 0, // Assuming first sheet
            startRowIndex: rowIndex - 1, // 0-based for API
            endRowIndex: rowIndex,
            startColumnIndex: 0,
            endColumnIndex: 20 // Highlight first 20 columns
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1.0,
                green: 0.0,
                blue: 0.0,
                alpha: 0.3
              }
            }
          },
          fields: 'userEnteredFormat.backgroundColor'
        }
      }];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        resource: { requests }
      });

      console.log(`Highlighted row ${rowIndex} in red`);
    } catch (error) {
      console.error('Error highlighting row:', error);
      throw error;
    }
  }

  async validateQRCode(qrNumber) {
    try {
      const { data } = await this.getSheetData();
      
      // Find the row with matching Number
      const matchingRow = data.find(row => row.Number === qrNumber.toString());
      
      if (!matchingRow) {
        return {
          valid: false,
          error: 'QR code not found in records',
          errorType: 'NOT_FOUND'
        };
      }

      // Check if QR image exists
      if (!matchingRow.Image || matchingRow.Image.trim() === '') {
        return {
          valid: false,
          error: 'No QR Code exists, manual check needed if guest persists ticket bought',
          errorType: 'NO_IMAGE'
        };
      }

      // Get ticket count and current scans used
      const totalTickets = parseInt(matchingRow['Enter total number of tickets needed (Kids above 8 - ticket required)'] || '0');
      const scansUsed = parseInt(matchingRow['Scans Used'] || '0');

      // Check if all scans are used
      if (scansUsed >= totalTickets) {
        return {
          valid: false,
          error: 'All QR Codes already used',
          errorType: 'ALREADY_USED'
        };
      }

      // Valid QR code - can be scanned
      return {
        valid: true,
        rowData: matchingRow,
        totalTickets,
        scansUsed,
        remainingScans: totalTickets - scansUsed
      };
    } catch (error) {
      console.error('Error validating QR code:', error);
      throw error;
    }
  }

  async processValidScan(qrNumber) {
    try {
      const validation = await this.validateQRCode(qrNumber);
      
      if (!validation.valid) {
        return validation;
      }

      // Increment scan count
      const newScanCount = validation.scansUsed + 1;
      await this.updateScanCount(validation.rowData.rowIndex, newScanCount);

      // Highlight the row in red
      await this.highlightRow(validation.rowData.rowIndex);

      return {
        valid: true,
        message: 'QR Code valid - Entry granted!',
        scansUsed: newScanCount,
        totalTickets: validation.totalTickets,
        remainingScans: validation.totalTickets - newScanCount,
        guestName: validation.rowData.name || 'Guest'
      };
    } catch (error) {
      console.error('Error processing valid scan:', error);
      throw error;
    }
  }

  // Helper function to convert column number to letter (A, B, C, etc.)
  numberToColumnLetter(columnNumber) {
    let columnLetter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return columnLetter;
  }
}

export default new GoogleSheetsService(); 