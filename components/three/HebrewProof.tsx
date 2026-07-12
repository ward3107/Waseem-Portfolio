import React from 'react';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Scene from './Scene';
import HebrewDepthText from './HebrewDepthText';

/**
 * HebrewProof — Phase-1 risk check. Renders Hebrew headline copy as dimensional
 * 3D type to confirm shaping, depth, parallax, lighting and bloom all hold up
 * before we build the real Hero on top of it.
 *
 * The real DOM headline sits behind (aria-visible); this canvas is aria-hidden.
 */
const HebrewProof: React.FC = () => {
  const fallback = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.5rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: 'clamp(2rem,7vw,4rem)', margin: 0, color: '#ece9fb' }}>
        בונים אתרים
      </h1>
      <h2 style={{ fontSize: 'clamp(1.5rem,5vw,3rem)', margin: 0, color: '#8a76e0' }}>
        שנשארים בזיכרון
      </h2>
    </div>
  );

  return (
    <Scene minHeight="100vh" fallback={fallback} camera={{ position: [0, 0, 7], fov: 42 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, 2]} intensity={0.5} color="#3ee9ff" />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <group position={[0, 0.9, 0]}>
          <HebrewDepthText fontSize={1.5} color="#f4f2ff" depthColor="#3b2f8a">
            בונים אתרים
          </HebrewDepthText>
        </group>
      </Float>

      <group position={[0, -1.1, 0]}>
        <HebrewDepthText
          fontSize={1.1}
          color="#e3d095"
          depthColor="#6b5510"
          layers={10}
          parallax={0.34}
        >
          שנשארים בזיכרון
        </HebrewDepthText>
      </group>

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.45}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Scene>
  );
};

export default HebrewProof;
