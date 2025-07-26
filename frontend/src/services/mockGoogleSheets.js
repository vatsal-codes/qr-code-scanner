// Mock Google Sheets Service for Development and Demonstration
// This simulates the Google Sheets API functionality for browser environments

class MockGoogleSheetsService {
  constructor() {
    this.initialized = false;
    // Mock data simulating your Google Sheet
    this.mockData = [
      {
        Image: 'https://example.com/qr1.png',
        'Enter total number of tickets needed (Kids above 8 - ticket required)': '2',
        Number: '1001',
        name: 'John Doe',
        email: 'john@example.com',
        'phone number': '555-0123',
        'Scans Used': '0',
        rowIndex: 2
      },
      {
        Image: 'https://example.com/qr2.png',
        'Enter total number of tickets needed (Kids above 8 - ticket required)': '1',
        Number: '1002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        'phone number': '555-0124',
        'Scans Used': '0',
        rowIndex: 3
      },
      {
        Image: 'https://example.com/qr3.png',
        'Enter total number of tickets needed (Kids above 8 - ticket required)': '3',
        Number: '1003',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        'phone number': '555-0125',
        'Scans Used': '2',
        rowIndex: 4
      },
      {
        Image: '', // No QR image to test error case
        'Enter total number of tickets needed (Kids above 8 - ticket required)': '1',
        Number: '1004',
        name: 'Alice Brown',
        email: 'alice@example.com',
        'phone number': '555-0126',
        'Scans Used': '0',
        rowIndex: 5
      }
    ];
  }

  async initialize() {
    if (this.initialized) return;

    // Simulate API initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.initialized = true;
    console.log('Mock Google Sheets API initialized successfully');
  }

  async getSheetData() {
    await this.initialize();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const headers = [
      'Image',
      'Enter total number of tickets needed (Kids above 8 - ticket required)',
      'Number',
      'name',
      'email',
      'phone number',
      'Scans Used'
    ];
    
    return { headers, data: this.mockData };
  }

  async addScansUsedColumn() {
    await this.initialize();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Scans Used column already exists (mock)');
    return 6; // Column index
  }

  async updateScanCount(rowIndex, newScanCount) {
    await this.initialize();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find and update the mock data
    const row = this.mockData.find(item => item.rowIndex === rowIndex);
    if (row) {
      row['Scans Used'] = newScanCount.toString();
    }
    
    console.log(`Updated scan count for row ${rowIndex} to ${newScanCount} (mock)`);
  }

  async highlightRow(rowIndex) {
    await this.initialize();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`Highlighted row ${rowIndex} in red (mock)`);
  }

  async validateQRCode(qrNumber) {
    try {
      await this.initialize();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Find the row with matching Number
      const matchingRow = this.mockData.find(row => row.Number === qrNumber.toString());
      
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
}

export default new MockGoogleSheetsService(); 