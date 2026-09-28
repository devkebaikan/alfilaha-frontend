import { useRef, useState, useEffect } from "react";
import { FiCamera, FiX } from "react-icons/fi";

const WebcamCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(
          "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.",
        );
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onCapture(file);
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-lg h-full max-h-[80vh] bg-black">
        {error ? (
          <div className="text-white p-4 text-center">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 items-center">
        <button
          type="button"
          onClick={onCancel}
          className="w-14 h-14 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition"
        >
          <FiX size={24} />
        </button>
        <button
          type="button"
          onClick={handleCapture}
          className="w-20 h-20 bg-white border-4 border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <FiCamera size={32} />
        </button>
      </div>
    </div>
  );
};

export default WebcamCapture;
