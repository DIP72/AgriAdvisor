import React, { useState, useRef } from 'react';
import DiseaseResultCard from './DiseaseResultCard';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCropDisease } from '../services/geminiVision';

const CropScanner = () => {
  const { language, setLanguage, isMarathi } = useLanguage();

  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image selection from camera or gallery
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const url = URL.createObjectURL(file);
    setImageURL(url);
    setImage(file);
  };

  // Run disease detection via Gemini Vision API
  const handleScan = async () => {
    if (!image) return;

    try {
      setLoading(true);
      setError(null);
      const disease = await analyzeCropDisease(image);
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
      ? `${result.marathi}. ${result.description_marathi}. उपाय: ${result.organic_marathi}. आत्ता करा: ${result.immediate_action_marathi}`
      : `${result.name}. ${result.description}. Treatment: ${result.organic_treatment}. Do this now: ${result.immediate_action}`;

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
    <div className="min-h-screen bg-green-50 pb-10">
      
      {/* STEP 1 — REDESIGN THE HEADER SECTION */}
      <div className="bg-gradient-to-br from-green-600 to-green-800
                      rounded-b-3xl px-5 pt-6 pb-8 mb-6 shadow-lg">

        {/* Top bar with back button and language toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 bg-white bg-opacity-20 rounded-full
                       flex items-center justify-center text-white"
          >
            ←
          </button>
          <div className="flex bg-white bg-opacity-20 rounded-full p-1">
            <button
              onClick={() => setLanguage('english')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                ${language === 'english'
                  ? 'bg-white text-green-700'
                  : 'text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('marathi')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                ${language === 'marathi'
                  ? 'bg-white text-green-700'
                  : 'text-white'}`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Icon and title */}
        <div className="text-center text-white">
          <div className="text-6xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold mb-1">
            {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
          </h1>
          <p className="text-green-100 text-sm">
            {isMarathi
              ? 'पानाचा फोटो घेऊन रोग तपासा'
              : 'Scan your crop leaf to detect disease instantly'}
          </p>
        </div>
      </div>

      {/* STEP 2 — REDESIGN THE UPLOAD AREA */}
      {!imageURL ? (
        <div className="px-4 mb-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-green-300 rounded-3xl
                       bg-white p-8 text-center cursor-pointer
                       hover:border-green-500 hover:bg-green-50
                       active:scale-98 transition-all duration-200 shadow-sm"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                            justify-center mx-auto mb-4">
              <span className="text-4xl">📸</span>
            </div>
            <h3 className="font-semibold text-green-800 text-lg mb-1">
              {isMarathi ? 'फोटो निवडा' : 'Select a Photo'}
            </h3>
            <p className="text-green-600 text-sm mb-4">
              {isMarathi
                ? 'कॅमेरा उघडा किंवा गॅलरीतून फोटो निवडा'
                : 'Open camera or upload from your gallery'}
            </p>

            {/* Two styled buttons side by side */}
            <div className="flex gap-3 justify-center">
              <div className="flex items-center gap-2 bg-green-600 text-white
                              px-4 py-2.5 rounded-2xl text-sm font-medium shadow-md">
                <span>📷</span>
                <span>{isMarathi ? 'कॅमेरा' : 'Camera'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white border-2
                              border-green-400 text-green-700
                              px-4 py-2.5 rounded-2xl text-sm font-medium">
                <span>🖼️</span>
                <span>{isMarathi ? 'गॅलरी' : 'Gallery'}</span>
              </div>
            </div>
          </div>

          {/* Hidden actual file input */}
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
        <div className="px-4 mb-5">
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              ref={imageRef}
              src={imageURL}
              alt="Crop leaf"
              className="w-full h-72 object-cover"
              crossOrigin="anonymous"
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16
                            bg-gradient-to-t from-black/60 to-transparent" />

            {/* Remove button top right */}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-9 h-9 bg-black bg-opacity-50
                         rounded-full flex items-center justify-center
                         text-white text-lg hover:bg-opacity-70 transition-all"
            >
              ✕
            </button>

            {/* Change photo button bottom left */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 left-3 bg-white bg-opacity-90
                         text-green-700 text-xs font-medium px-3 py-1.5
                         rounded-full flex items-center gap-1 shadow-sm"
            >
              📷 {isMarathi ? 'बदला' : 'Change'}
            </button>
          </div>
          {/* Hidden input even in preview mode to allow "Change" button to work */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      )}

      {/* STEP 3 — REDESIGN THE SCAN BUTTON */}
      {imageURL && !result && (
        <div className="px-4 mb-5">
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500
                       hover:from-green-700 hover:to-green-600
                       disabled:from-green-300 disabled:to-green-200
                       text-white font-bold py-5 rounded-3xl text-lg
                       shadow-lg shadow-green-200 transition-all
                       active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent
                                rounded-full animate-spin" />
                <span>
                  {isMarathi ? 'AI विश्लेषण होत आहे...' : 'AI Analysing...'}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">🔬</span>
                <span>
                  {isMarathi ? 'रोग तपासा' : 'Detect Disease'}
                </span>
              </>
            )}
          </button>
          <p className="text-center text-green-600 text-xs mt-2">
            {isMarathi
              ? 'Gemini AI द्वारे विश्लेषण'
              : 'Powered by Gemini AI'}
          </p>
        </div>
      )}

      {/* STEP 4 — REDESIGN THE ERROR MESSAGE */}
      {error && (
        <div className="mx-4 mb-5 bg-red-50 border border-red-200
                        rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-medium text-red-700 text-sm mb-0.5">
              {isMarathi ? 'त्रुटी आली' : 'Something went wrong'}
            </p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-50 text-xs underline mt-1"
              style={{ color: '#ef4444' }}
            >
              {isMarathi ? 'पुन्हा प्रयत्न करा' : 'Try again'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 — REDESIGN THE TIPS SECTION */}
      {!imageURL && (
        <div className="px-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>💡</span>
            {isMarathi ? 'चांगल्या निकालासाठी टिप्स' : 'Tips for Better Results'}
          </h3>
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white rounded-2xl p-3 shadow-sm
                            border border-green-100 flex gap-2 items-start">
              <span className="text-xl flex-shrink-0">📸</span>
              <p className="text-xs text-green-700 leading-relaxed">
                {isMarathi
                  ? 'पानाचा जवळचा स्पष्ट फोटो घ्या'
                  : 'Take a clear close-up of the leaf'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm
                            border border-green-100 flex gap-2 items-start">
              <span className="text-xl flex-shrink-0">☀️</span>
              <p className="text-xs text-green-700 leading-relaxed">
                {isMarathi
                  ? 'चांगल्या प्रकाशात फोटो काढा'
                  : 'Ensure good natural lighting'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm
                            border border-green-100 flex gap-2 items-start">
              <span className="text-xl flex-shrink-0">🍃</span>
              <p className="text-xs text-green-700 leading-relaxed">
                {isMarathi
                  ? 'एकाच पानावर लक्ष केंद्रित करा'
                  : 'Focus on a single leaf only'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm
                            border border-green-100 flex gap-2 items-start">
              <span className="text-xl flex-shrink-0">🚿</span>
              <p className="text-xs text-green-700 leading-relaxed">
                {isMarathi
                  ? 'धुळीने माखलेले पान साफ करा'
                  : 'Clean dusty leaves before scan'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* STEP 8 — WRAP RESULT AND BUTTONS */}
      <div className="px-4 space-y-4">
        <DiseaseResultCard
          result={result}
          language={language}
          onReadAloud={handleReadAloud}
          onSave={handleSave}
        />
      </div>

      {/* STEP 6 — REDESIGN SCAN AGAIN BUTTON */}
      {result && (
        <div className="px-4 mt-6 mb-8">
          <button
            onClick={handleReset}
            className="w-full border-2 border-green-500 text-green-600
                       font-semibold py-4 rounded-3xl hover:bg-green-50
                       active:scale-95 transition-all flex items-center
                       justify-center gap-2"
          >
            <span className="text-xl">📷</span>
            <span>
              {isMarathi ? 'नवीन फोटो स्कॅन करा' : 'Scan Another Photo'}
            </span>
          </button>
        </div>
      )}

    </div>
  );
};

export default CropScanner;
