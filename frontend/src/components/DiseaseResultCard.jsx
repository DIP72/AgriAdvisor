import React from 'react';

const severityConfig = {
  High: {
    color: 'bg-red-100 border-red-400 text-red-700',
    badge: 'bg-red-500 text-white',
    emoji: '🔴'
  },
  Medium: {
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    badge: 'bg-yellow-500 text-white',
    emoji: '🟡'
  },
  Low: {
    color: 'bg-green-100 border-green-400 text-green-700',
    badge: 'bg-green-500 text-white',
    emoji: '🟢'
  },
  None: {
    color: 'bg-green-100 border-green-400 text-green-700',
    badge: 'bg-green-500 text-white',
    emoji: '✅'
  }
};

const DiseaseResultCard = ({ result, language, onReadAloud, onSave }) => {
  if (!result) return null;

  const config = severityConfig[result.severity] || severityConfig.Low;
  const isMarathi = language === 'marathi';

  return (
    <div className={`border-2 rounded-2xl p-5 mt-4 ${config.color}`}>

      {/* Disease Name */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold">
            {config.emoji} {isMarathi ? result.marathi : result.name}
          </h2>
          <p className="text-sm opacity-75">
            {isMarathi ? result.name : result.marathi}
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${config.badge}`}>
          {result.severity === 'None' ? '✅ Healthy' : `⚠️ ${result.severity} Risk`}
        </span>
      </div>

      {/* Confidence Score */}
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">
          🎯 {isMarathi ? 'विश्वसनीयता' : 'Confidence'}: {result.confidence}%
        </p>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-current"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white bg-opacity-50 rounded-xl p-3 mb-3">
        <p className="text-sm font-medium mb-1">
          📋 {isMarathi ? 'काय होत आहे?' : 'What is happening?'}
        </p>
        <p className="text-sm">
          {isMarathi ? result.description_marathi : result.description}
        </p>
      </div>

      {/* Treatment */}
      {result.severity !== 'None' && (
        <div className="space-y-2 mb-3">
          <div className="bg-white bg-opacity-50 rounded-xl p-3">
            <p className="text-sm font-medium mb-1">
              🌿 {isMarathi ? 'सेंद्रिय उपाय' : 'Organic Treatment'}
            </p>
            <p className="text-sm">
              {isMarathi ? result.organic_marathi : result.organic_treatment}
            </p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-xl p-3">
            <p className="text-sm font-medium mb-1">
              💊 {isMarathi ? 'रासायनिक उपाय' : 'Chemical Treatment'}
            </p>
            <p className="text-sm">
              {isMarathi ? result.chemical_marathi : result.chemical_treatment}
            </p>
          </div>
        </div>
      )}

      {/* Immediate Action Alert */}
      {result.immediate_action && result.severity !== 'None' && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3">
          <p className="text-sm font-medium text-red-700 mb-1">
            ⚡ {isMarathi ? 'आत्ता करा' : 'Do This Now'}
          </p>
          <p className="text-sm text-red-600">
            {isMarathi
              ? result.immediate_action_marathi
              : result.immediate_action}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onReadAloud}
          className="flex-1 bg-white bg-opacity-70 hover:bg-opacity-100
                     text-gray-800 font-medium py-2 px-3 rounded-xl
                     text-sm transition-all flex items-center justify-center gap-1"
        >
          🔊 {isMarathi ? 'मोठ्याने वाचा' : 'Read Aloud'}
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-white bg-opacity-70 hover:bg-opacity-100
                     text-gray-800 font-medium py-2 px-3 rounded-xl
                     text-sm transition-all flex items-center justify-center gap-1"
        >
          💾 {isMarathi ? 'जतन करा' : 'Save Result'}
        </button>
      </div>

    </div>
  );
};

export default DiseaseResultCard;
