import { useState, useEffect } from 'react';
import QRScanner from './components/QRScanner';
import ScanHistory from './components/ScanHistory';
import googleSheetsService from './services/mockGoogleSheets';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Google Sheets service and add the Scans Used column
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Initialize Google Sheets service
      await googleSheetsService.initialize();
      
      // Add the Scans Used column if it doesn't exist
      await googleSheetsService.addScansUsedColumn();
      
      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Failed to initialize app. Please check your Google Sheets configuration and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanResult = async (qrCode) => {
    if (!qrCode || isLoading) return;

    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      console.log('Processing QR code:', qrCode);
      
      // Process the scan with Google Sheets validation
      const result = await googleSheetsService.processValidScan(qrCode);
      
      // Create scan history entry
      const scanEntry = {
        qrCode,
        timestamp: Date.now(),
        status: result.valid ? 'valid' : 'error',
        message: result.message || result.error,
        guestName: result.guestName,
        scansUsed: result.scansUsed,
        totalTickets: result.totalTickets,
        remainingScans: result.remainingScans
      };

      // Add to scan history
      setScanHistory(prev => [scanEntry, ...prev]);

      // Set current scan result for display
      setScanResult({
        ...result,
        qrCode
      });

      // Auto-clear result after 5 seconds for valid scans, 8 seconds for errors
      setTimeout(() => {
        setScanResult(null);
      }, result.valid ? 5000 : 8000);

    } catch (err) {
      console.error('Error processing scan:', err);
      const errorMessage = err.message || 'Failed to validate QR code. Please try again.';
      
      const scanEntry = {
        qrCode,
        timestamp: Date.now(),
        status: 'error',
        message: errorMessage
      };
      
      setScanHistory(prev => [scanEntry, ...prev]);
      setScanResult({
        valid: false,
        error: errorMessage,
        qrCode
      });
      
      setTimeout(() => {
        setScanResult(null);
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleScanning = () => {
    setIsScanning(!isScanning);
    // Clear any previous scan results when starting/stopping
    setScanResult(null);
    setError(null);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    if (scanResult.valid) {
      return (
        <div className="status-valid mb-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold">Entry Granted!</span>
          </div>
          <div className="text-center">
            <p className="text-lg mb-2">{scanResult.message}</p>
            {scanResult.guestName && (
              <p className="text-sm opacity-90 mb-2">Welcome, {scanResult.guestName}!</p>
            )}
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span>Scans: {scanResult.scansUsed}/{scanResult.totalTickets}</span>
              {scanResult.remainingScans > 0 && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  {scanResult.remainingScans} remaining
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="status-error mb-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold">Access Denied</span>
          </div>
          <p className="text-center">{scanResult.error}</p>
        </div>
      );
    }
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing QR Scanner</h2>
          <p className="text-gray-600">Setting up Google Sheets integration...</p>
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Initialization Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={initializeApp}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Event QR Scanner
              </h1>
              <p className="text-gray-600 text-sm">
                Scan QR codes to validate event tickets
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          {/* Global Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
                <span className="text-sm">Processing QR code...</span>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {renderScanResult()}

          {/* QR Scanner */}
          <QRScanner
            onScanResult={handleScanResult}
            isScanning={isScanning}
            onToggleScanning={handleToggleScanning}
          />

          {/* Scan Stats */}
          {scanHistory.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{scanHistory.length}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {scanHistory.filter(s => s.status === 'valid').length}
                    </div>
                    <div className="text-gray-500">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {scanHistory.filter(s => s.status === 'error').length}
                    </div>
                    <div className="text-gray-500">Invalid</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Success Rate</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {scanHistory.length > 0 
                      ? Math.round((scanHistory.filter(s => s.status === 'valid').length / scanHistory.length) * 100)
                      : 0
                    }%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan History */}
          <ScanHistory
            scanHistory={scanHistory}
            onClearHistory={handleClearHistory}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
