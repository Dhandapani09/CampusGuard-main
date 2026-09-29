import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useVisitorContext } from '../context/VisitorContext';
import { CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import Button from '../components/shared/Button';
import './QRScanner.css';

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
          message: `Pre-registration located. Proceeding to
<truncated 1724 bytes