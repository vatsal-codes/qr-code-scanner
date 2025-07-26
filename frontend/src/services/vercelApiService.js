// Vercel API Service for Frontend
class VercelApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to connect to API: ${error.message}`);
    }
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return await response.json();
  }

  async processValidScan(qrNumber) {
    try {
      const result = await this.makeRequest('/api/process-scan', 'POST', { qrCode: qrNumber });
      return result;
    } catch (error) {
      if (error.message.includes('QR code not found')) {
        return { valid: false, message: "QR code not found in records", errorType: "NOT_FOUND" };
      } else if (error.message.includes('No QR Code exists')) {
        return { valid: false, message: "No QR Code exists, manual check needed if guest persists ticket bought", errorType: "NO_IMAGE" };
      } else if (error.message.includes('already used')) {
        return { valid: false, message: "All QR Codes already used", errorType: "LIMIT_EXCEEDED" };
      }
      return { valid: false, message: `Error processing scan: ${error.message}`, errorType: "PROCESSING_ERROR" };
    }
  }

  async addScansUsedColumn() {
    return { success: true };
  }

  async testConnection() {
    try {
      await this.initialize();
      return { success: true, message: 'Connected to Vercel API successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new VercelApiService();
