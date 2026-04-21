import React, { useState, useRef, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import DiseaseResultCard from './DiseaseResultCard';
import diseaseInfo from '../data/diseaseInfo.json';
import { useLanguage } from '../context/LanguageContext';

// Keyword map — matches MobileNet labels to our disease database
const DISEASE_KEYWORD_MAP = {
  'blight': 'Tomato Early Blight',
  'rust': 'Wheat Brown Rust',
  'mold': 'Tomato Late Blight',
  'fungus': 'Tomato Late Blight',
  'yellow': 'Soybean Yellow Mosaic',
  'mosaic': 'Soybean Yellow Mosaic',
  'curl': 'Tomato Leaf Curl',
  'red': 'Cotton Leaf Reddening',
  'purple': 'Onion Purple Blotch',
  'spot': 'Tomato Early Blight',
  'lesion': 'Onion Purple Blotch',
  'plant': 'Healthy',
  'leaf': 'Healthy',
  'flower': 'Healthy',
  'vegetable': 'Healthy',
};

const CropScanner = () => {
  const { language, isMarathi } = useLanguage();

  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  const modelRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load TensorFlow model on first use
  const loadModel = async () => {
    if (modelRef.current) return;
    try {
      setLoading(true);
      setError(null);
      modelRef.current = await mobilenet.load();
      setModelLoaded(true);
    } catch (err) {
      setError(isMarathi
        ? 'मॉडेल लोड करण्यात त्रुटी. इंटरनेट तपासा.'
        : 'Error loading model. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Map MobileNet prediction to our disease database
  const mapPredictionToDisease = (predictions) => {
    for (const prediction of predictions) {
      const label = prediction.className.toLowerCase();
      for (const [keyword, diseaseName] of Object.entries(DISEASE_KEYWORD_MAP)) {
        if (label.includes(keyword)) {
          const info = diseaseInfo[diseaseName];
          return {
            name: diseaseName,
            confidence: Math.round(prediction.probability * 100),
            ...info
          };
        }
      }
    }
    // Default to Healthy if no disease keyword matched
    return {
      name: 'Healthy',
      confidence: Math.round(predictions[0]?.probability * 100 || 85),
      ...diseaseInfo['Healthy']
    };
  };

  // Handle image selection from camera or gallery
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const url = URL.createObjectURL(file);
    setImageURL(url);
    setImage(file);

    // Auto-load model when image is selected
    if (!modelRef.current) {
      await loadModel();
    }
  };

  // Run disease detection
  const handleScan = async () => {
    if (!imageRef.current) return;

    try {
      setLoading(true);
      setError(null);

      if (!modelRef.current) {
        await loadModel();
      }

      const predictions = await modelRef.current.classify(imageRef.current);
      const disease = mapPredictionToDisease(predictions);
      setResult(disease);

    } catch (err) {
      setError(isMarathi
        ? 'स्कॅन करताना त्रुटी आली. पुन्हा प्रयत्न करा.'
        : 'Error during scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TTS Read Aloud
  const handleReadAloud = () => {
    if (!result) return;
    const text = isMarathi
      ? `${result.marathi}. ${result.description_marathi}. उपाय: ${result.organic_marathi}`
      : `${result.name}. ${result.description}. Treatment: ${result.organic_treatment}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isMarathi ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Save result to console (Phase 2 will save to MongoDB)
  const handleSave = () => {
    const savedResult = {
      disease: result.name,
      confidence: result.confidence,
      severity: result.severity,
      date: new Date().toLocaleDateString('en-IN'),
      timestamp: Date.now()
    };
    console.log('Scan saved:', savedResult);
    alert(isMarathi
      ? '✅ निकाल जतन केला!'
      : '✅ Result saved successfully!');
  };

  // Reset scanner
  const handleReset = () => {
    setImage(null);
    setImageURL(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 p-4">

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">
          🌿 {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
        </h1>
        <p className="text-sm text-green-600 mt-1">
          {isMarathi
            ? 'पानाचा फोटो घ्या आणि रोग तपासा'
            : 'Take a photo of your crop leaf to detect disease'}
        </p>
      </div>

      {/* Upload Area */}
      {!imageURL ? (
        <div
          className="border-2 border-dashed border-green-400 rounded-2xl p-8
                     text-center bg-white cursor-pointer hover:bg-green-50
                     transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-5xl mb-3">📸</div>
          <p className="text-green-700 font-medium">
            {isMarathi ? 'फोटो घ्या किंवा गॅलरीतून निवडा' : 'Take a photo or choose from gallery'}
          </p>
          <p className="text-green-500 text-sm mt-1">
            {isMarathi ? 'पानाचा स्पष्ट फोटो घ्या' : 'Make sure the leaf is clearly visible'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      ) : (
        <div className="space-y-4">

          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              ref={imageRef}
              src={imageURL}
              alt="Crop leaf"
              className="w-full h-64 object-cover"
              crossOrigin="anonymous"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-white rounded-full
                         w-8 h-8 flex items-center justify-center
                         shadow-md text-gray-600 hover:text-red-500"
            >
              ✕
            </button>
          </div>

          {/* Scan Button */}
          {!result && (
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300
                         text-white font-bold py-4 rounded-2xl text-lg
                         transition-all shadow-md"
            >
              {loading
                ? `⏳ ${isMarathi ? 'विश्लेषण होत आहे...' : 'Analysing...'}`
                : `🔍 ${isMarathi ? 'रोग तपासा' : 'Scan for Disease'}`}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Result Card */}
          <DiseaseResultCard
            result={result}
            language={language}
            onReadAloud={handleReadAloud}
            onSave={handleSave}
          />

          {/* Scan Again Button */}
          {result && (
            <button
              onClick={handleReset}
              className="w-full border-2 border-green-600 text-green-600
                         font-medium py-3 rounded-2xl hover:bg-green-50
                         transition-all"
            >
              📷 {isMarathi ? 'नवीन फोटो स्कॅन करा' : 'Scan Another Photo'}
            </button>
          )}

        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
        <p className="font-medium text-green-800 mb-2">
          💡 {isMarathi ? 'चांगल्या निकालासाठी टिप्स' : 'Tips for better results'}
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>📸 {isMarathi ? 'पानाचा स्पष्ट, जवळचा फोटो घ्या' : 'Take a clear close-up photo of the leaf'}</li>
          <li>☀️ {isMarathi ? 'चांगल्या प्रकाशात फोटो घ्या' : 'Ensure good lighting when taking the photo'}</li>
          <li>🍃 {isMarathi ? 'एकाच पानाचा फोटो घ्या' : 'Focus on a single leaf at a time'}</li>
          <li>🚫 {isMarathi ? 'धुळीने माखलेले पान साफ करा' : 'Clean dusty leaves before scanning'}</li>
        </ul>
      </div>

    </div>
  );
};

export default CropScanner;
