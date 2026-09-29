import React, { useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';

const WebcamCapture = ({ onCapture, skipped = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Reset captured/uploaded image when skipped flag changes
  React.useEffect(() => {
    setCapturedImage(null);
    setUploadedImage(null);
    onCapture(null);
  }, [skipped, onCapture]);

  const startCamera = async () => {
    setError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(true);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      onCapture(imageUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onCapture(null);
    startCamera();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        setUploadedImage(base64Data);
        onCapture(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    onCapture(null);
  };

  if (skipped) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[400px] mx-auto animate-in fade-in duration-300">
        <div className="relative w-full aspect-[4/3] bg-gray-800/40 border border-dashed border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center light:bg-gray-50 light:border-gray-200">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-gray-400 text-center p-6 light:text-gray-500">
              <ImageIcon size={48} className="opacity-50 text-indigo-400" />
              <p className="m-0 text-sm font-semibold text-white light:text-gray-900">Photo Capture Skipped</p>
              <p className="m-0 text-xs text-gray-500 light:text-gray-400 font-medium">VIP Protocol active. You can optionally upload a photo instead.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          {uploadedImage ? (
            <Button variant="secondary" onClick={clearUploadedImage} icon={X}>
              Remove Photo
            </Button>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold cursor-pointer border border-white/10 light:bg-gray-100 light:hover:bg-gray-200 light:text-gray-900 light:border-gray-200 transition-all select-none shadow-md">
              <ImageIcon size={14} />
              <span>Upload Photo File</span>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[400px] mx-auto">
      <div className="relative w-full aspect-[4/3] bg-gray-800/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center light:bg-gray-100 light:border-gray-200">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!stream && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 text-center p-6 bg-gray-800/40 light:bg-gray-100 light:text-gray-500">
                <Camera size={48} className="text-gray-500" />
                <p className="m-0 text-sm font-medium">Click "Start Camera" to initialize</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 text-center p-6 bg-red-500/5 light:bg-red-50">
                <X size={48} />
                <p className="m-0 text-sm font-medium">Camera access denied or unavailable.<br/>(Using fallback avatar)</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="flex justify-center">
        {!capturedImage && !stream && (
          <Button variant="secondary" onClick={startCamera} icon={Camera}>
            Start Camera
          </Button>
        )}
        
        {!capturedImage && stream && (
          <Button variant="primary" onClick={capturePhoto} icon={Camera}>
            Capture Photo
          </Button>
        )}
        
        {capturedImage && (
          <Button variant="secondary" onClick={retakePhoto} icon={RefreshCw}>
            Retake Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;