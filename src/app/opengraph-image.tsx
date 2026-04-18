import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PlotArmour Merch | Custom Merch & Gifting';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          position: 'relative',
        }}
      >
        {/* Subtle grid background to match the website's grid-wires */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Central Brutalist Panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '8px solid #000000',
            boxShadow: '16px 16px 0 0 #ff2323',
            padding: '60px 80px',
            maxWidth: '1000px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#000000',
              marginBottom: 24,
              display: 'flex',
            }}
          >
            PlotArmour Merch
          </div>
          
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 0.9,
              textTransform: 'uppercase',
              color: '#000000',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ display: 'flex' }}>Custom merch</span>
            <span style={{ display: 'flex', color: '#ff2323' }}>
              that doesn't look mid.
            </span>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 28,
              fontWeight: 700,
              color: '#4a4a4a',
              display: 'flex',
            }}
          >
            Bulk orders • Swag Kits • Corporate Gifting
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
