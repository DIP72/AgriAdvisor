import React, { useState, useRef } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import DiseaseResultCard from './DiseaseResultCard';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCropDisease } from '../services/geminiVision';

// --- Sub-Components with Enhanced Centering ---

const HeaderCard = ({ isMarathi, setScreen }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-green-100 dark:border-gray-700 w-full"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <button 
        onClick={() => setScreen('home')}
        className="p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors text-green-600"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
      >
        <ArrowLeft size={24} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl" style={{ display: 'flex' }}>
          <Leaf className="text-green-600" size={24} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white" style={{ margin: 0, lineHeight: 1.2 }}>
            {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium" style={{ margin: 0 }}>
            {isMarathi ? 'झटपट रोग ओळखा' : 'Scan your crop leaf to detect disease instantly'}
          </p>
        </div>
      </div>
    </div>
    <div className="hidden sm:flex p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
      <Sparkles className="text-yellow-500" size={20} />
    </div>
  </motion.div>
);

const UploadCard = ({ imageURL, onReset, onFileSelect, fileInputRef, isMarathi }) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg border border-green-50 dark:border-gray-700 w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    {!imageURL ? (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-4 border-dashed border-green-100 dark:border-gray-700 rounded-2xl p-8 sm:p-12 group transition-all"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: 'rgba(232, 245, 233, 0.3)' }}
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6 group-hover:scale-110 transition-transform" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {isMarathi ? 'फोटो निवडा' : 'Select a Photo'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
          {isMarathi ? 'कॅमेरा किंवा गॅलरीतून निवडा' : 'Open camera or upload from gallery'}
        </p>
        
        <div className="flex gap-4 w-full max-w-sm" style={{ display: 'flex', width: '100%' }}>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-200 dark:shadow-none transition-all border-none cursor-pointer">
            <Camera size={20} />
            {isMarathi ? 'कॅमेरा' : 'Camera'}
          </button>
          <button className="flex-1 bg-white dark:bg-gray-700 border-2 border-green-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-green-50 dark:hover:bg-gray-600 transition-all cursor-pointer">
            <ImageIcon size={20} />
            {isMarathi ? 'गॅलरी' : 'Gallery'}
          </button>
        </div>
      </div>
    ) : (
      <div className="w-full relative rounded-2xl overflow-hidden shadow-xl ring-4 ring-green-50 dark:ring-gray-700">
        <img src={imageURL} alt="Preview" className="w-full h-72 object-cover" style={{ display: 'block' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 p-2.5 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform border-none cursor-pointer flex"
        >
          <RotateCcw size={22} />
        </button>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl">
          <CheckCircle2 size={16} />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {tips.map((tip, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:border-green-300">
          <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-xl text-green-600 shrink-0 flex">
            <tip.icon size={20} />
          </div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-snug m-0">
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

  const fileInputRef = useRef(null);

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
      setError(isMarathi ? `स्कॅन करताना त्रुटी आली: ${err.message}` : `Scan failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageURL(null);
    setResult(null);
    setError(null);
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
    const savedResult = {
      disease: result.name,
      confidence: result.confidence,
      severity: result.severity,
      date: new Date().toLocaleDateString('en-IN'),
      timestamp: Date.now()
    };
    console.log('Scan saved:', savedResult);
    alert(isMarathi ? '✅ निकाल जतन केला!' : '✅ Result saved successfully!');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-900/80 pb-32 pt-4 px-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center">
        
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-black py-4.5 rounded-3xl text-xl transition-all shadow-xl shadow-green-200 dark:shadow-none flex items-center justify-center gap-4 border-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>{isMarathi ? 'AI विश्लेषण होत आहे...' : 'Analysing your crop...'}</span>
                </>
              ) : (
                <>
                  <Search size={28} />
                  <span>{isMarathi ? 'माझ्या पिकाची तपासणी करा' : 'Scan My Crop'}</span>
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
              className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/40 rounded-2xl p-5 text-red-700 dark:text-red-400 font-bold flex items-center gap-4 w-full shadow-sm"
            >
              <AlertCircle size={28} className="shrink-0" />
              <div className="text-sm">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 w-full"
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
