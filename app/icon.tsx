import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f1ec',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 800,
        color: '#14181c',
        letterSpacing: '-0.02em',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      dkr
    </div>,
    { ...size },
  );
}
