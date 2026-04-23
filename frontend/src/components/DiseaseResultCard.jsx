import React from 'react';

// ── Severity palette ─────────────────────────────────────────────────────────
const SEVERITY = {
  High: {
    accent: '#dc2626',
    accentLight: '#fef2f2',
    accentBorder: '#fecaca',
    badge: { bg: '#dc2626', color: '#fff' },
    bar: '#dc2626',
    label: 'High Risk',
    icon: '🔴'
  },
  Medium: {
    accent: '#d97706',
    accentLight: '#fffbeb',
    accentBorder: '#fde68a',
    badge: { bg: '#d97706', color: '#fff' },
    bar: '#d97706',
    label: 'Medium Risk',
    icon: '🟡'
  },
  Low: {
    accent: '#16a34a',
    accentLight: '#f0fdf4',
    accentBorder: '#bbf7d0',
    badge: { bg: '#16a34a', color: '#fff' },
    bar: '#16a34a',
    label: 'Low Risk',
    icon: '🟢'
  },
  None: {
    accent: '#16a34a',
    accentLight: '#f0fdf4',
    accentBorder: '#bbf7d0',
    badge: { bg: '#16a34a', color: '#fff' },
    bar: '#16a34a',
    label: 'Healthy',
    icon: '✅'
  }
};

// ── Section block ────────────────────────────────────────────────────────────
const Section = ({ icon, title, text, accent }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '1.5px solid #f3f4f6',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
    <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>{text}</p>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const DiseaseResultCard = ({ result, language, onReadAloud, onSave }) => {
  if (!result) return null;

  const isMarathi = language === 'marathi';
  const sev = SEVERITY[result.severity] || SEVERITY.Low;

  const diseaseName  = isMarathi ? result.marathi   : result.name;
  const diseaseAlt   = isMarathi ? result.name       : result.marathi;
  const description  = isMarathi ? result.description_marathi : result.description;
  const organic      = isMarathi ? result.organic_marathi     : result.organic_treatment;
  const chemical     = isMarathi ? result.chemical_marathi    : result.chemical_treatment;
  const action       = isMarathi ? result.immediate_action_marathi : result.immediate_action;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
      border: '1.5px solid #f3f4f6',
      width: '100%',
      boxSizing: 'border-box'
    }}>

      {/* ── Accent top bar ── */}
      <div style={{ height: '5px', background: sev.accent }} />

      {/* ── Header ── */}
      <div style={{
        padding: '20px 20px 16px',
        background: sev.accentLight,
        borderBottom: `1.5px solid ${sev.accentBorder}`
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{sev.icon}</span>
              <h2 style={{
                margin: 0, fontSize: '20px', fontWeight: 900,
                color: '#111827', lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {diseaseName}
              </h2>
            </div>
            {diseaseAlt && (
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 500, paddingLeft: '28px' }}>
                {diseaseAlt}
              </p>
            )}
          </div>

          {/* Severity badge */}
          <div style={{
            background: sev.badge.bg, color: sev.badge.color,
            padding: '5px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 800,
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: `0 2px 8px ${sev.accent}40`
          }}>
            {sev.label}
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
              {isMarathi ? 'विश्वसनीयता' : 'Confidence'}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: sev.accent }}>
              {result.confidence}%
            </span>
          </div>
          <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              background: `linear-gradient(90deg, ${sev.accent} 0%, ${sev.accent}99 100%)`,
              width: `${result.confidence}%`,
              transition: 'width 0.8s ease'
            }} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Description */}
        <Section
          icon="📋"
          title={isMarathi ? 'काय होत आहे?' : 'What is happening?'}
          text={description}
          accent={sev.accent}
        />

        {result.severity !== 'None' && (
          <>
            {/* Organic */}
            <Section
              icon="🌿"
              title={isMarathi ? 'सेंद्रिय उपाय' : 'Organic Treatment'}
              text={organic}
              accent="#16a34a"
            />

            {/* Chemical */}
            <Section
              icon="💊"
              title={isMarathi ? 'रासायनिक उपाय' : 'Chemical Treatment'}
              text={chemical}
              accent="#7c3aed"
            />

            {/* Immediate action */}
            {action && (
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
                border: '1.5px solid #fca5a5',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#dc2626', color: '#fff',
                  borderRadius: '10px', padding: '6px 8px',
                  fontSize: '16px', lineHeight: 1, flexShrink: 0
                }}>
                  ⚡
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isMarathi ? 'आत्ता करा' : 'Do This Now'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: 1.6 }}>
                    {action}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={onReadAloud}
            style={{
              flex: 1, border: '1.5px solid #e5e7eb', background: '#f9fafb',
              borderRadius: '14px', padding: '12px 8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', fontSize: '12px', fontWeight: 700, color: '#374151',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            🔊 {isMarathi ? 'मोठ्याने वाचा' : 'Read Aloud'}
          </button>
          <button
            onClick={onSave}
            style={{
              flex: 1, border: 'none',
              background: `linear-gradient(135deg, ${sev.accent} 0%, ${sev.accent}cc 100%)`,
              borderRadius: '14px', padding: '12px 8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', fontSize: '12px', fontWeight: 700, color: '#fff',
              cursor: 'pointer', boxShadow: `0 4px 12px ${sev.accent}40`
            }}
          >
            💾 {isMarathi ? 'जतन करा' : 'Save Result'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DiseaseResultCard;
