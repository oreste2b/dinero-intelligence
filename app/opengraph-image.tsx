import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f1ec',
        fontFamily: 'system-ui, sans-serif',
        gap: 0,
      }}
    >
      {/* Logo pill */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          background: '#e8e4dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 800,
          color: '#14181c',
          letterSpacing: '-0.02em',
          marginBottom: 36,
          boxShadow: '8px 8px 20px rgba(133,148,160,.35),-8px -8px 20px rgba(255,255,255,.9)',
        }}
      >
        dkr
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#14181c',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        Dinero Intelligence
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 28,
          color: '#4b5560',
          marginTop: 22,
          letterSpacing: '-0.01em',
          fontWeight: 500,
        }}
      >
        AI-drevet regnskabsoverblik · CRM · Dinero.dk
      </div>

      {/* Tag row */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 40,
        }}
      >
        {['Udgifter', 'Omsætning', 'Moms', 'Leads'].map((tag) => (
          <div
            key={tag}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              background: '#e8e4dc',
              fontSize: 18,
              fontWeight: 600,
              color: '#4b5560',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
