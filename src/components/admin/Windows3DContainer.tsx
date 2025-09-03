import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Window3DProps {
  position: [number, number, number];
  size: [number, number];
  title: string;
  children: React.ReactNode;
  onMove?: (position: [number, number, number]) => void;
  onResize?: (size: [number, number]) => void;
  isActive?: boolean;
  onFocus?: () => void;
}

const Window3D: React.FC<Window3DProps> = ({ 
  position, 
  size, 
  title, 
  children, 
  onMove, 
  onResize, 
  isActive = false,
  onFocus 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
    }
  });

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    onFocus?.();
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (event: any) => {
    if (isDragging && onMove) {
      const newPosition: [number, number, number] = [
        event.point.x,
        event.point.y,
        event.point.z
      ];
      onMove(newPosition);
    }
  };

  return (
    <group position={position}>
      {/* Window Frame */}
      <RoundedBox
        ref={meshRef}
        args={[size[0], size[1], 0.2]}
        radius={0.05}
        smoothness={4}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={isActive ? "#2563eb" : hovered ? "#3b82f6" : "#1e293b"}
          metalness={0.1}
          roughness={0.3}
          transparent={true}
          opacity={0.9}
        />
      </RoundedBox>

      {/* Title Bar */}
      <RoundedBox
        position={[0, size[1] / 2 - 0.3, 0.11]}
        args={[size[0] - 0.1, 0.4, 0.05]}
        radius={0.02}
      >
        <meshStandardMaterial
          color={isActive ? "#1d4ed8" : "#334155"}
          metalness={0.2}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Title Text */}
      <Text
        position={[-size[0] / 2 + 0.2, size[1] / 2 - 0.3, 0.15]}
        fontSize={0.15}
        color="white"
        anchorX="left"
        anchorY="middle"
        font="/fonts/roboto-regular.woff"
      >
        {title}
      </Text>

      {/* Window Controls */}
      <group position={[size[0] / 2 - 0.3, size[1] / 2 - 0.3, 0.15]}>
        {/* Close Button */}
        <RoundedBox position={[0, 0, 0]} args={[0.1, 0.1, 0.02]} radius={0.01}>
          <meshStandardMaterial color="#ef4444" />
        </RoundedBox>
        {/* Minimize Button */}
        <RoundedBox position={[-0.15, 0, 0]} args={[0.1, 0.1, 0.02]} radius={0.01}>
          <meshStandardMaterial color="#f59e0b" />
        </RoundedBox>
        {/* Maximize Button */}
        <RoundedBox position={[-0.3, 0, 0]} args={[0.1, 0.1, 0.02]} radius={0.01}>
          <meshStandardMaterial color="#10b981" />
        </RoundedBox>
      </group>

      {/* Content Area */}
      <Html
        position={[0, -0.2, 0.11]}
        transform
        occlude
        style={{
          width: `${size[0] * 100}px`,
          height: `${(size[1] - 0.6) * 100}px`,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '16px',
          overflow: 'auto',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
        center
      >
        {children}
      </Html>

      {/* Glow Effect */}
      {isActive && (
        <RoundedBox
          args={[size[0] + 0.1, size[1] + 0.1, 0.25]}
          radius={0.06}
          position={[0, 0, -0.01]}
        >
          <meshStandardMaterial
            color="#60a5fa"
            transparent={true}
            opacity={0.3}
            emissive="#60a5fa"
            emissiveIntensity={0.2}
          />
        </RoundedBox>
      )}
    </group>
  );
};

interface Windows3DContainerProps {
  children: React.ReactNode;
  windows: Array<{
    id: string;
    title: string;
    position: [number, number, number];
    size: [number, number];
    content: React.ReactNode;
  }>;
}

export const Windows3DContainer: React.FC<Windows3DContainerProps> = ({ windows }) => {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [windowStates, setWindowStates] = useState(windows);

  const handleWindowMove = (id: string, position: [number, number, number]) => {
    setWindowStates(prev =>
      prev.map(w => w.id === id ? { ...w, position } : w)
    );
  };

  const handleWindowResize = (id: string, size: [number, number]) => {
    setWindowStates(prev =>
      prev.map(w => w.id === id ? { ...w, size } : w)
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ height: '100vh' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />

          {/* Environment */}
          <mesh position={[0, 0, -10]} rotation={[0, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial
              color="#0f172a"
              transparent={true}
              opacity={0.5}
            />
          </mesh>

          {/* Windows */}
          {windowStates.map((window) => (
            <Window3D
              key={window.id}
              position={window.position}
              size={window.size}
              title={window.title}
              onMove={(position) => handleWindowMove(window.id, position)}
              onResize={(size) => handleWindowResize(window.id, size)}
              isActive={activeWindow === window.id}
              onFocus={() => setActiveWindow(window.id)}
            >
              {window.content}
            </Window3D>
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={15}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold mb-2">3D Admin Dashboard</h3>
          <p className="text-sm opacity-75">
            Click and drag windows • Use mouse to orbit • Scroll to zoom
          </p>
        </div>
      </div>

      {/* Window Manager */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 text-white">
          <h4 className="text-sm font-semibold mb-2">Windows</h4>
          <div className="space-y-1">
            {windowStates.map((window) => (
              <button
                key={window.id}
                onClick={() => setActiveWindow(window.id)}
                className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  activeWindow === window.id
                    ? 'bg-blue-500/50 text-white'
                    : 'hover:bg-white/10'
                }`}
              >
                {window.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};