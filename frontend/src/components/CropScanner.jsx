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
  Clock,
  ShieldAlert,
  Zap
} from 'lucide-react';
import DiseaseResultCard from './DiseaseResultCard';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCropDisease } from '../services/geminiVision';

// ─── Upload Card ──────────────────────────────────────────────────────────────

const UploadCard = ({ imageURL, onReset, onFileSelect, fileInputRef, isMarathi }) => (
  <div style={{
    background: '#fff',
    borderRadius: '24px',
    padding: '24px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #dcfce7',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }}>
    {!imageURL ? (
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          border: '3px dashed #86efac',
          borderRadius: '20px',
          padding: '40px 24px',
          cursor: 'pointer',
          background: 'rgba(240,253,244,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          width: '72px',
          height: '72px',
          background: '#dcfce7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Camera color="#16a34a" size={36} />
        </div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#1f2937' }}>
          {isMarathi ? 'पीक फोटो निवडा' : 'Select a Crop Photo'}
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '12px', color: '#6b7280' }}>
          {isMarathi ? 'कॅमेरा किंवा गॅलरीतून निवडा' : 'Use camera or upload from gallery'}
        </p>

        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '280px' }}>
          <div style={{
            flex: 1, background: '#16a34a', color: '#fff', fontWeight: 700,
            padding: '12px', borderRadius: '14px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            gap: '6px', fontSize: '12px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
          }}>
            <Camera size={16} /> {isMarathi ? 'कॅमेरा' : 'Camera'}
          </div>
          <div style={{
            flex: 1, background: '#f9fafb', border: '1.5px solid #d1fae5',
            color: '#374151', fontWeight: 700, padding: '12px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', fontSize: '12px'
          }}>
            <ImageIcon size={16} /> {isMarathi ? 'गॅलरी' : 'Gallery'}
          </div>
        </div>
      </div>
    ) : (
      <div style={{ width: '100%', position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <img src={imageURL} alt="Preview" style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <RotateCcw size={18} />
        </button>
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: '#16a34a', color: '#fff', padding: '6px 12px',
          borderRadius: '10px', fontSize: '11px', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <CheckCircle2 size={13} />
          {isMarathi ? 'फोटो तयार आहे' : 'Photo Ready'}
        </div>
      </div>
    )}

    <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
      style={{ display: 'none' }} onChange={onFileSelect} />
  </div>
);

// ─── Tips Grid ────────────────────────────────────────────────────────────────

const TipsGrid = ({ isMarathi }) => {
  const tips = [
    { icon: Search, label: isMarathi ? 'स्पष्ट जवळचा फोटो घ्या' : 'Clear close-up photo' },
    { icon: Sparkles, label: isMarathi ? 'चांगला प्रकाश' : 'Good lighting' },
    { icon: Leaf, label: isMarathi ? 'एकाच पानावर लक्ष द्या' : 'Single leaf focus' },
    { icon: AlertCircle, label: isMarathi ? 'स्कॅन करण्यापूर्वी स्वच्छ करा' : 'Clean leaf before scan' }
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
      {tips.map((tip, idx) => (
        <div key={idx} style={{
          background: '#fff', border: '1.5px solid #d1fae5', borderRadius: '16px',
          padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            background: '#dcfce7', borderRadius: '10px', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <tip.icon color="#16a34a" size={16} />
          </div>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#374151', lineHeight: 1.3, textAlign: 'left' }}>
            {tip.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CropScanner = ({ setScreen }) => {
  const { language, isMarathi } = useLanguage();

  const [image, setImage]     = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError]     = useState(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const autoRetryRef = useRef(false);

  const fileInputRef = useRef(null);

  // Countdown timer — auto-retries scan once wait is over
  useEffect(() => {
    if (retryAfter <= 0) return;
    const t = setInterval(() => {
      setRetryAfter(p => {
        if (p === 1 && autoRetryRef.current && image && !loading) {
          // Window just reset → auto-fire the scan
          setTimeout(() => {
            autoRetryRef.current = false;
            setError(null);
            handleScan();
          }, 500);
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [retryAfter]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null); setError(null); setStatusMsg('');
    setImageURL(URL.createObjectURL(file));
    setImage(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true); setError(null); setStatusMsg('');
    try {
      const disease = await analyzeCropDisease(image, setStatusMsg);
      setResult(disease);
    } catch (err) {
      if (err.message === 'QUOTA_EXCEEDED') {
        autoRetryRef.current = true;
        setRetryAfter(60);
        setError(isMarathi
          ? 'API कोटा संपला. ६० सेकंदात आपोआप पुन्हा प्रयत्न होईल.'
          : 'API quota exceeded. Auto-retrying in 60 seconds...');
      } else if (err.message === 'SERVICE_UNAVAILABLE') {
        setError(isMarathi
          ? 'Gemini 2.5 Flash सर्व्हर खूप व्यस्त आहे. कृपया काही मिनिटांनी पुन्हा प्रयत्न करा.'
          : 'Gemini 2.5 Flash is under very high demand. Please try again in a few minutes.');
      } else if (err.message === 'JSON_PARSE_ERROR') {
        setError(isMarathi
          ? 'AI प्रतिसाद समजला नाही. पानाचा अधिक स्पष्ट फोटो घ्या.'
          : 'AI response unclear. Try a clearer, closer photo of the leaf.');
      } else {
        setError(`Scan failed: ${err.message}`);
      }
    } finally {
      setLoading(false); setStatusMsg('');
    }
  };

  const handleReset = () => {
    setImage(null); setImageURL(null); setResult(null);
    setError(null); setStatusMsg(''); setRetryAfter(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReadAloud = () => {
    if (!result) return;
    const text = isMarathi
      ? `${result.marathi}. ${result.description_marathi}. उपाय: ${result.organic_marathi}.`
      : `${result.name}. ${result.description}. Treatment: ${result.organic_treatment}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = isMarathi ? 'mr-IN' : 'en-IN'; u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const btnDisabled = loading || retryAfter > 0;

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0fdf4 0%, #f9fafb 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '24px', paddingBottom: '100px',
      paddingLeft: '16px', paddingRight: '16px',
      boxSizing: 'border-box', overflowY: 'auto'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        width: '100%', maxWidth: '560px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', gap: '20px'
      }}>

        {/* ─ Page title (lightweight, no full header card) ─ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
          <div style={{
            background: '#dcfce7', borderRadius: '12px', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Leaf color="#16a34a" size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1f2937' }}>
              {isMarathi ? 'पीक रोग स्कॅनर' : 'Crop Disease Scanner'}
            </h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
              {isMarathi ? 'Gemini 2.5 Flash AI द्वारे' : 'Powered by Gemini 2.5 Flash AI'}
            </p>
          </div>
        </div>

        {/* Upload */}
        <UploadCard
          imageURL={imageURL} onReset={handleReset}
          onFileSelect={handleImageChange} fileInputRef={fileInputRef}
          isMarathi={isMarathi}
        />

        {/* Scan Button */}
        {imageURL && !result && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={handleScan} disabled={btnDisabled}
            style={{
              width: '100%', border: 'none', cursor: btnDisabled ? 'not-allowed' : 'pointer',
              background: btnDisabled
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff', fontWeight: 800, fontSize: '17px',
              padding: '18px', borderRadius: '20px',
              boxShadow: btnDisabled ? 'none' : '0 8px 24px rgba(22,163,74,0.35)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '4px', transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isMarathi ? 'AI विश्लेषण होत आहे...' : 'AI Analysing...'}</span>
                </div>
                {statusMsg && (
                  <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>{statusMsg}</span>
                )}
              </>
            ) : retryAfter > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={22} />
                <span>{isMarathi ? `${retryAfter} सेकंद थांबा` : `Wait ${retryAfter}s`}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={22} />
                <span>{isMarathi ? 'तपासणी करा' : 'Scan My Crop'}</span>
              </div>
            )}
          </motion.button>
        )}

        {/* Tips */}
        {!result && !loading && <TipsGrid isMarathi={isMarathi} />}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                background: '#fff', border: '2px solid #fecaca',
                borderRadius: '20px', padding: '18px',
                display: 'flex', alignItems: 'flex-start',
                gap: '14px', boxShadow: '0 4px 20px rgba(239,68,68,0.08)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '4px', background: '#ef4444'
              }} />
              <ShieldAlert color="#ef4444" size={26} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#991b1b', marginBottom: '4px' }}>
                  {isMarathi ? 'सेवा व्यत्यय' : 'Service Interruption'}
                </div>
                <div style={{ fontSize: '12px', color: '#b91c1c', lineHeight: 1.6 }}>{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', background: '#dcfce7', borderRadius: '12px',
                padding: '8px 16px', fontSize: '11px', fontWeight: 700, color: '#15803d'
              }}>
                <Zap size={13} />
                {isMarathi ? 'Gemini AI द्वारे विश्लेषण केले' : 'Analysed by Gemini AI'}
              </div>

              <DiseaseResultCard
                result={result} language={language}
                onReadAloud={handleReadAloud}
                onSave={() => alert(isMarathi ? '✅ निकाल जतन केला!' : '✅ Result saved!')}
              />

              <button
                onClick={handleReset}
                style={{
                  width: '100%', padding: '16px', borderRadius: '18px',
                  border: '2px solid #16a34a', background: 'transparent',
                  color: '#16a34a', fontWeight: 700, fontSize: '15px',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
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
