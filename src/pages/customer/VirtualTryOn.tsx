import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { DesignModel } from '../../types';
import { Camera, Upload, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

export const VirtualTryOn: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [designs, setDesigns] = useState<DesignModel[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<DesignModel | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const fetchDesigns = async () => {
      const { data } = await supabase
        .from('design_models')
        .select('*')
        .eq('is_approved', true)
        .limit(12);

      if (data) {
        setDesigns(data);
      }
    };

    fetchDesigns();
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Unable to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsWebcamActive(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Try-On Studio</h1>
        <p className="text-gray-600 mb-8">See how designs look on you before ordering!</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video bg-black relative">
                {isWebcamActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                      width={640}
                      height={480}
                    />
                    {selectedDesign && (
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                        }}
                      >
                        <img
                          src={selectedDesign.model_url}
                          alt={selectedDesign.name}
                          className="w-48 h-auto opacity-80"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                    <Camera className="text-gray-400" size={48} />
                    <p className="text-gray-400">Click "Start Webcam" to begin</p>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  {isWebcamActive ? (
                    <button
                      onClick={stopWebcam}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      <Camera size={20} />
                      Stop Webcam
                    </button>
                  ) : (
                    <button
                      onClick={startWebcam}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      <Camera size={20} />
                      Start Webcam
                    </button>
                  )}
                  <button
                    onClick={captureFrame}
                    disabled={!isWebcamActive}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    <Upload size={20} />
                    Capture
                  </button>
                </div>

                {selectedDesign && isWebcamActive && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <ZoomOut size={20} className="text-gray-600" />
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <ZoomIn size={20} className="text-gray-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCw size={20} className="text-gray-600" />
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Designs</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {designs.map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`w-full p-4 rounded-lg border-2 transition text-left ${
                    selectedDesign?.id === design.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{design.name}</p>
                  <p className="text-sm text-gray-600">{design.garment_type}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {design.color_options.slice(0, 3).map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
