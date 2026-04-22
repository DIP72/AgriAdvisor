import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Search, 
  Loader2, 
  Leaf, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Clock,
  ShieldAlert
} from 'lucide-react';
import DiseaseResultCard from './DiseaseResultCard';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCropDisease } from '../services/geminiVision';

// --- Sub-Components ---

const HeaderCard = ({ isMarathi, setScreen }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-green-100 dark:border-gray-700 w-full max-w-[600px]"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button 
        onClick={() => setScreen('home')}
        className="p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors text-green-600 flex items-center justify-center border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={22} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Leaf className="text-green-600" size={22} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white m-0 leading-tight">
            {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium m-0">
            {isMarathi ? 'झटपट रोग ओळखा' : 'Scan your crop leaf instantly'}
          </p>
        </div>
      </div>
    </div>
    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
      <Sparkles className="text-yellow-500" size={18} />
    </div>
  </motion.div>
);

const UploadCard = ({ imageURL, onReset, onFileSelect, fileInputRef, isMarathi }) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-green-50 dark:border-gray-700 w-full max-w-[600px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    {!imageURL ? (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-4 border-dashed border-green-100 dark:border-gray-700 rounded-2xl p-8 sm:p-10 group transition-all bg-green-50/20 dark:bg-green-900/5 flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
          <Camera size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 m-0 mb-1">
          {isMarathi ? 'फोटो निवडा' : 'Select a Photo'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mb-6">
          {isMarathi ? 'कॅमेरा किंवा गॅलरीतून निवडा' : 'Open camera or upload from gallery'}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '280px' }}>
          <div className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md">
            <Camera size={16} />
            {isMarathi ? 'कॅमेरा' : 'Camera'}
          </div>
          <div className="flex-1 bg-white dark:bg-gray-700 border border-green-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs">
            <ImageIcon size={16} />
            {isMarathi ? 'गॅलरी' : 'Gallery'}
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
        <img src={imageURL} alt="Preview" className="w-full h-64 object-cover block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 p-2 rounded-xl text-red-500 shadow-lg hover:scale-110 transition-transform border-none cursor-pointer flex items-center justify-center"
        >
          <RotateCcw size={18} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg">
          <CheckCircle2 size={12} />
          {isMarathi ? 'फोटो तयार आहे' : 'Photo Ready'}
        </div>
      </div>
    )}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={onFileSelect}
    />
  </div>
);

const TipsGrid = ({ isMarathi }) => {
  const tips = [
    { icon: Search, label: isMarathi ? 'स्पष्ट जवळचा फोटो घ्या' : 'Clear close-up photo' },
    { icon: Sparkles, label: isMarathi ? 'चांगला प्रकाश' : 'Good lighting' },
    { icon: Leaf, label: isMarathi ? 'एकाच पानावर लक्ष द्या' : 'Single leaf focus' },
    { icon: AlertCircle, label: isMarathi ? 'स्कॅन करण्यापूर्वी पान स्वच्छ करा' : 'Clean leaf before scan' },
  ];

  return (
    <div className="w-full max-w-[600px] grid grid-cols-2 gap-3">
      {tips.map((tip, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 p-3 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 shrink-0 flex items-center justify-center">
            <tip.icon size={16} />
          </div>
          <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 leading-tight m-0 text-left">
            {tip.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// --- Main Page Component ---

const CropScanner = ({ setScreen }) => {
  const { language, isMarathi } = useLanguage();

  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setImage(file);
  };

  const handleScan = async () => {
    if (!image) return;
    try {
      setLoading(true);
      setError(null);
      const disease = await analyzeCropDisease(image);
      setResult(disease);
    } catch (err) {
      if (err.message === 'QUOTA_EXCEEDED') {
        setRetryAfter(35);
        setError(isMarathi 
          ? 'तुमचा रोजचा मोफत कोटा संपला आहे. कृपया ३५ सेकंद थांबा.' 
          : 'Free daily quota exceeded. Please wait 35 seconds for the next request.');
      } else if (err.message === 'MODEL_NOT_FOUND') {
        setError(isMarathi 
          ? 'Gemini 2.0 मॉडेल उपलब्ध नाही. कृपया तुमचा API की तपासा.' 
          : 'Gemini 2.0 model not found. Please verify your API key permissions.');
      } else if (err.message === 'JSON_PARSE_ERROR') {
        setError(isMarathi 
          ? 'AI प्रतिसादात त्रुटी आली. कृपया अधिक स्पष्ट फोटोसह पुन्हा प्रयत्न करा.' 
          : 'AI response error. Please try again with a clearer, more focused photo.');
      } else {
        setError(isMarathi ? `स्कॅन अयशस्वी: ${err.message}` : `Scan failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageURL(null);
    setResult(null);
    setError(null);
    setRetryAfter(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  const handleSave = () => {
    alert(isMarathi ? '✅ निकाल जतन केला!' : '✅ Result saved successfully!');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center pt-6 px-4 pb-32 overflow-y-auto">
      <div className="w-full max-w-[600px] flex flex-col items-center gap-6">
        
        {/* 1. Header Card */}
        <HeaderCard isMarathi={isMarathi} setScreen={setScreen} />

        {/* 2. Upload Card */}
        <UploadCard
          imageURL={imageURL}
          onReset={handleReset}
          onFileSelect={handleImageChange}
          fileInputRef={fileInputRef}
          isMarathi={isMarathi}
        />

        {/* 3. CTA Button */}
        {imageURL && !result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[600px]">
            <button
              onClick={handleScan}
              disabled={loading || retryAfter > 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-black py-4 rounded-3xl text-lg flex items-center justify-center gap-3 shadow-xl border-none cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>{isMarathi ? 'AI विश्लेषण होत आहे...' : 'Analysing...'}</span>
                </>
              ) : retryAfter > 0 ? (
                <>
                  <Clock size={24} />
                  <span>{isMarathi ? `कृपया ${retryAfter} सेकंद थांबा` : `Wait ${retryAfter}s`}</span>
                </>
              ) : (
                <>
                  <Search size={24} />
                  <span>{isMarathi ? 'तपासणी करा' : 'Scan My Crop'}</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* 4. Tips Grid */}
        {!result && !loading && <TipsGrid isMarathi={isMarathi} />}

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/40 rounded-2xl p-5 text-red-700 dark:text-red-400 font-bold flex items-center gap-4 w-full shadow-lg"
            >
              <ShieldAlert size={28} className="shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-xs text-left leading-relaxed">
                <div className="font-black text-sm mb-1">{isMarathi ? 'सूचना' : 'Attention Required'}</div>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-6"
            >
              <DiseaseResultCard
                result={result}
                language={language}
                onReadAloud={handleReadAloud}
                onSave={handleSave}
              />
              
              <button
                onClick={handleReset}
                className="w-full py-4 rounded-2xl border-2 border-green-600 text-green-600 font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
              >
                <Camera size={20} />
                {isMarathi ? 'दुसरा फोटो स्कॅन करा' : 'Scan Another Photo'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CropScanner;
