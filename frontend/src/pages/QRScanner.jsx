import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useVisitorContext } from '../context/VisitorContext';
import { CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import Button from '../components/shared/Button';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const { activeVisitors, checkOut } = useVisitorContext();

  useEffect(() => {
    // Initialize Scanner on mount
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { 
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scanner.render(
        (decodedText) => {
          // On Success
          handleScanSuccess(decodedText, scanner);
        },
        (err) => {
          // Ignore frequent error callbacks from html5-qrcode
        }
      );
      
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, []);

  const handleScanSuccess = (decodedText, scanner) => {
    scanner.pause(true); // Pause scanning once we get a result
    
    // Check if it's an active visitor to checkout
    const visitor = activeVisitors.find(v => v.id === decodedText);
    
    if (visitor) {
      checkOut(visitor.id);
      setScanResult({
        success: true,
        message: `Checked Out: ${visitor.name}`,
        type: 'checkout'
      });
    } else {
      // Simulate quick check-in for pre-registered OR invalid pass
      if (decodedText.startsWith('VIS-') || decodedText.length > 5) {
        setScanResult({
          success: true,
          message: `Pre-registration located. Proceeding to entry...`,
          type: 'checkin'
        });
        setTimeout(() => navigate('/gate/entry'), 2000);
      } else {
        setScanResult({
          success: false,
          message: 'Invalid or unrecognized QR Code format.',
          type: 'error'
        });
        setTimeout(() => {
          setScanResult(null);
          try {
            scanner.resume();
          } catch (e) {
            console.error(e);
          }
        }, 3000);
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0">
          <QrCode size={32} className="inline-block align-middle mr-2 text-indigo-500" />
          Fast-Track QR Scanner
        </h1>
        <p className="text-sm text-gray-400 light:text-gray-500 m-0">
          Scan visitor passes for instant check-in or checkout.
        </p>
      </div>

      <div className="p-8 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 flex flex-col items-center justify-center min-h-[400px] mt-6">
        {!scanResult ? (
          <div id="reader" className="w-full overflow-hidden rounded-xl border border-white/10 light:border-gray-200"></div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 animate-in duration-200">
            {scanResult.success ? (
              <CheckCircle size={64} className="text-emerald-400 light:text-emerald-500" />
            ) : (
              <AlertTriangle size={64} className="text-red-400 light:text-red-500" />
            )}
            <h2 className="text-2xl font-bold text-white light:text-gray-900 font-heading m-0">
              {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
            </h2>
            <p className="text-base text-gray-300 light:text-gray-600 m-0">
              {scanResult.message}
            </p>
            
            {scanResult.type === 'checkout' && (
              <div className="mt-4">
                <Button variant="primary" onClick={resetScanner}>
                  Scan Next Pass
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;