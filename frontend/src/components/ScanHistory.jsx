import { useState } from 'react';

const ScanHistory = ({ scanHistory, onClearHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Valid</span>;
      case 'error':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Invalid</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Unknown</span>;
    }
  };

  if (!scanHistory || scanHistory.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Scan History</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No scans yet</p>
          <p className="text-sm text-gray-400">Start scanning QR codes to see history here</p>
        </div>
      </div>
    );
  }

  const displayHistory = isExpanded ? scanHistory : scanHistory.slice(0, 3);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Scan History ({scanHistory.length})
        </h3>
        {scanHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayHistory.map((scan, index) => (
          <div key={index} className="history-item">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(scan.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      QR Code: {scan.qrCode}
                    </p>
                    {getStatusBadge(scan.status)}
                  </div>
                  
                  {scan.guestName && (
                    <p className="text-sm text-gray-600 mb-1">
                      Guest: {scan.guestName}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {scan.message}
                  </p>
                  
                  {scan.status === 'valid' && scan.scansUsed && scan.totalTickets && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>Scans Used: {scan.scansUsed}/{scan.totalTickets}</span>
                      {scan.remainingScans > 0 && (
                        <span className="text-green-600">
                          {scan.remainingScans} remaining
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    {formatTime(scan.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {scanHistory.length > 3 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? (
              <>
                Show Less
                <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                Show All ({scanHistory.length - 3} more)
                <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {scanHistory.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Total Scans: {scanHistory.length} | 
              Valid: {scanHistory.filter(s => s.status === 'valid').length} | 
              Invalid: {scanHistory.filter(s => s.status === 'error').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanHistory; 