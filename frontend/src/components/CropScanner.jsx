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

// --- Sub-Components with Inline Style Fallbacks ---

const HeaderCard = ({ isMarathi, setScreen }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-green-100 dark:border-gray-700"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <button 
        onClick={() => setScreen('home')}
        className="p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors text-green-600"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <ArrowLeft size={24} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl" style={{ display: 'flex' }}>
          <Leaf className="text-green-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ margin: 0, lineHeight: 1 }}>
            {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium" style={{ margin: 0 }}>
            {isMarathi ? 'झटपट रोग ओळखा' : 'Scan your crop leaf to detect disease instantly'}
          </p>
        </div>
      </div>
    </div>
    <Sparkles className="text-green-500 hidden sm:block" size={24} />
  </motion.div>
);

const UploadCard = ({ imageURL, onReset, onFileSelect, fileInputRef, isMarathi }) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md border border-green-50 dark:border-gray-700" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    {!imageURL ? (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-4 border-dashed border-green-100 dark:border-gray-700 rounded-2xl p-10 group"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 group-hover:scale-110 transition-transform" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1" style={{ margin: '0 0 4px 0' }}>
          {isMarathi ? 'फोटो निवडा' : 'Select a Photo'}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6" style={{ margin: '0 0 24px 0' }}>
          {isMarathi ? 'कॅमेरा किंवा गॅलरीतून निवडा' : 'Open camera or upload from gallery'}
        </p>
        
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '320px' }}>
          <div className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md">
            <Camera size={18} />
            {isMarathi ? 'कॅमेरा' : 'Camera'}
          </div>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm">
            <ImageIcon size={18} />
            {isMarathi ? 'गॅलरी' : 'Gallery'}
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full relative rounded-2xl overflow-hidden shadow-sm">
        <img src={imageURL} alt="Preview" className="w-full h-64 object-cover" style={{ display: 'block' }} />
        <div className="absolute inset-0 bg-black/20" />
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-xl text-red-500 shadow-lg hover:scale-110 transition-transform border-none cursor-pointer"
        >
          <RotateCcw size={20} />
        </button>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
          <CheckCircle2 size={14} />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: 'grid' }}>
      {tips.map((tip, idx) => (
        <div key={idx} className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-4 rounded-2xl shadow-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl text-green-600 shadow-sm shrink-0" style={{ display: 'flex' }}>
            <tip.icon size={20} />
          </div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300" style={{ margin: 0, lineHeight: 1.2 }}>
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
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" style={{ width: '100%', maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto' }}>
        
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
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-black py-4 rounded-2xl text-xl transition-all shadow-xl shadow-green-200 dark:shadow-none"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', border: 'none', cursor: 'pointer' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>{isMarathi ? 'AI विश्लेषण होत आहे...' : 'Analysing your crop...'}</span>
                </>
              ) : (
                <>
                  <Search size={24} />
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
              className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-4 text-red-700 dark:text-red-400 font-bold"
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px' }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <DiseaseResultCard
                result={result}
                language={language}
                onReadAloud={handleReadAloud}
                onSave={handleSave}
              />
              
              <button
                onClick={handleReset}
                className="w-full py-4 rounded-2xl border-2 border-green-600 text-green-600 font-bold hover:bg-green-50 transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: 'transparent', cursor: 'pointer' }}
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
