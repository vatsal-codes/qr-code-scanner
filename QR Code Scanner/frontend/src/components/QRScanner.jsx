import { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRScanner = ({ onScanResult, isScanning, onToggleScanning }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // Initialize the QR code reader
    readerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isScanning && hasPermission) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [isScanning, hasPermission]);

  const requestCameraPermission = async () => {
    try {
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      console.log('Camera permission granted');
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Camera permission is required to scan QR codes. Please allow camera access and try again.');
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setError(null);
      
      // Get video stream with back camera preference
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set up video element
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', true);
      videoRef.current.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });

      // Start continuous scanning
      scanContinuously();
      
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Failed to start camera. Please ensure you have granted camera permissions.');
    }
  };

  const scanContinuously = async () => {
    if (!readerRef.current || !videoRef.current || !isScanning) return;

    try {
      const result = await readerRef.current.decodeOnceFromVideoDevice(
        undefined, // Use default video device
        videoRef.current
      );
      
      if (result) {
        console.log('QR Code detected:', result.getText());
        onScanResult(result.getText());
        
        // Brief pause before next scan to prevent duplicate scans
        setTimeout(() => {
          if (isScanning) {
            scanContinuously();
          }
        }, 2000);
      }
    } catch (err) {
      // No QR code found, continue scanning
      if (isScanning) {
        requestAnimationFrame(() => scanContinuously());
      }
    }
  };

  const stopScanning = () => {
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset reader
    if (readerRef.current) {
      readerRef.current.reset();
    }
  };

  const handleToggleScanning = () => {
    if (!hasPermission && !isScanning) {
      requestCameraPermission().then(() => {
        if (hasPermission !== false) {
          onToggleScanning();
        }
      });
    } else {
      onToggleScanning();
    }
  };

  return (
    <div className="qr-scanner">
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        {!isScanning ? (
          <div className="flex items-center justify-center h-64 bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">Camera Preview</p>
              <p className="text-sm text-gray-300">Press scan to start</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              id="camera-preview"
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="qr-overlay">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  Position QR code here
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
          {hasPermission === false && (
            <button
              onClick={requestCameraPermission}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Request Camera Permission
            </button>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleToggleScanning}
          className={`scan-button ${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-600'}`}
          disabled={hasPermission === false}
        >
          {isScanning ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Stop Scanning
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Start Scanning
            </div>
          )}
        </button>
      </div>

      {hasPermission === null && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Camera permission is required to scan QR codes
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 