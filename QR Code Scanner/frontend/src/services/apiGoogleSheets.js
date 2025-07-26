// API Google Sheets Service for Frontend
// This connects to the Node.js backend API that handles Google Sheets integration

class ApiGoogleSheetsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔌 Initializing backend API connection...');
      
      // Test connection to backend
      const healthResponse = await this.makeRequest('/api/health', 'GET');
      console.log('✅ Backend health check passed:', healthResponse.message);

      // Initialize Google Sheets service on backend
      const initResponse = await this.makeRequest('/api/initialize', 'POST');
      console.log('✅ Backend Google Sheets service initialized:', initResponse.message);

      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize API connection:', error);
      throw new Error(`Backend API connection failed: ${error.message}`);
    }
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(`📡 Making ${method} request to: ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`❌ API request failed (${method} ${url}):`, error.message);
      
      // Provide user-friendly error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on ' + this.baseURL);
      }
      
      throw error;
    }
  }

  async getSheetData() {
    await this.initialize();
    
    try {
      const response = await this.makeRequest('/api/sheet-data', 'GET');
      return {
        headers: response.headers,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error fetching sheet data:', error);
      throw error;
    }
  }

  async addScansUsedColumn() {
    await this.initialize();
    // This is handled during initialization on the backend
    console.log('✅ Scans Used column handled by backend');
    return 0;
  }

  async updateScanCount(rowIndex, newScanCount) {
    await this.initialize();
    
    try {
      const response = await this.makeRequest('/api/update-scan-count', 'POST', {
        rowIndex,
        scanCount: newScanCount
      });
      
      console.log('✅ Scan count updated:', response.message);
    } catch (error) {
      console.error('❌ Error updating scan count:', error);
      throw error;
    }
  }

  async highlightRow(rowIndex) {
    await this.initialize();
    
    try {
      const response = await this.makeRequest('/api/highlight-row', 'POST', {
        rowIndex
      });
      
      console.log('✅ Row highlighted:', response.message);
    } catch (error) {
      console.error('❌ Error highlighting row:', error);
      throw error;
    }
  }

  async validateQRCode(qrNumber) {
    await this.initialize();
    
    try {
      const response = await this.makeRequest('/api/validate-qr', 'POST', {
        qrCode: qrNumber
      });
      
      return {
        valid: response.valid,
        error: response.error,
        errorType: response.errorType,
        rowData: response.rowData,
        totalTickets: response.totalTickets,
        scansUsed: response.scansUsed,
        remainingScans: response.remainingScans
      };
    } catch (error) {
      console.error('❌ Error validating QR code:', error);
      throw error;
    }
  }

  async processValidScan(qrNumber) {
    await this.initialize();
    
    try {
      console.log(`🎯 Processing scan for QR code: ${qrNumber}`);
      
      const response = await this.makeRequest('/api/process-scan', 'POST', {
        qrCode: qrNumber
      });
      
      const result = {
        valid: response.valid,
        message: response.message,
        error: response.error,
        errorType: response.errorType,
        scansUsed: response.scansUsed,
        totalTickets: response.totalTickets,
        remainingScans: response.remainingScans,
        guestName: response.guestName
      };

      if (result.valid) {
        console.log(`🎉 Successfully processed scan for ${result.guestName}`);
      } else {
        console.log(`❌ Scan failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error processing scan:', error);
      
      // Return a user-friendly error response
      return {
        valid: false,
        error: `Connection error: ${error.message}. Please check your internet connection and try again.`,
        errorType: 'CONNECTION_ERROR'
      };
    }
  }

  // Utility method to test the connection
  async testConnection() {
    try {
      const response = await this.makeRequest('/api/health', 'GET');
      return {
        connected: true,
        message: response.message,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

export default new ApiGoogleSheetsService(); 