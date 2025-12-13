import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { PLYLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

// --- SPINNER DI CARICAMENTO ---
function LoadingSpinner({ progress }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-neutral-900/90 p-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-white font-mono">{progress}%</span>
      </div>
    </Html>
  );
}

// --- MESSAGGIO DI ERRORE ---
function ErrorMessage({ message }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-red-900/90 p-4 rounded-xl shadow-2xl border border-red-500/30 backdrop-blur-md max-w-xs">
        <span className="text-sm font-bold text-white">Errore</span>
        <span className="text-xs text-red-200 text-center">{message}</span>
      </div>
    </Html>
  );
}

// --- LUCI DELLA SCENA ---
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
    </>
  );
}

// --- COMPONENTE MESH 3D (STL/PLY) ---
function Model3D({ geometry, material }) {
  const meshRef = useRef();
  
  useEffect(() => {
    if (!geometry) return;
    
    // Calcola normali per illuminazione corretta
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
    
    // Centra la geometria
    geometry.computeBoundingBox();
    geometry.center();
    
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
  );
}

// --- COMPONENTE OBJ (gruppo di mesh) ---
function ObjModel({ object, material }) {
  const groupRef = useRef();
  
  useEffect(() => {
    if (!object) return;
    
    // Calcola bounding box totale per centrare
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    // Centra l'oggetto
    object.position.sub(center);
    
    // Applica materiale a tutte le mesh
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.geometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
      }
    });
  }, [object, material]);

  return <primitive ref={groupRef} object={object} />;
}

// --- CONTENUTO 3D PRINCIPALE ---
function SceneContent({ file, onLoaded, onError }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Materiale dentale standard
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#e2e8f0',
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
    flatShading: false,
  }), []);

  // Caricamento file
  useEffect(() => {
    if (!file) return;
    
    let isMounted = true;
    
    setLoading(true);
    setProgress(0);
    setError(null);
    setModel(null);

    const extension = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file);
    
    // Seleziona loader
    let loader;
    switch (extension) {
      case 'stl':
        loader = new STLLoader();
        break;
      case 'ply':
        loader = new PLYLoader();
        break;
      case 'obj':
        loader = new OBJLoader();
        break;
      default:
        setError(`Formato .${extension} non supportato`);
        setLoading(false);
        URL.revokeObjectURL(url);
        return;
    }

    // Carica il file
    loader.load(
      url,
      (result) => {
        if (!isMounted) return;
        setModel({ data: result, type: extension });
        setLoading(false);
        setProgress(100);
        onLoaded?.();
        URL.revokeObjectURL(url);
      },
      (xhr) => {
        if (!isMounted) return;
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(percent);
        }
      },
      (err) => {
        if (!isMounted) return;
        console.error('Errore caricamento:', err);
        setError('Impossibile caricare il file');
        setLoading(false);
        onError?.();
        URL.revokeObjectURL(url);
      }
    );

    return () => {
      isMounted = false;
      URL.revokeObjectURL(url);
    };
  }, [file, onLoaded, onError]);

  // Cleanup materiale
  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  // Stati di render
  if (loading) {
    return <LoadingSpinner progress={progress} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!model) {
    return null;
  }

  // STL e PLY → BufferGeometry
  if (model.type === 'stl' || model.type === 'ply') {
    return <Model3D geometry={model.data} material={material} />;
  }

  // OBJ → Object3D/Group
  if (model.type === 'obj') {
    return <ObjModel object={model.data} material={material} />;
  }

  return null;
}

// --- COMPONENTE PRINCIPALE ESPORTATO ---
export default function FileRenderer({ file }) {
  const [isReady, setIsReady] = useState(false);
  
  // Key unica per forzare reset quando cambia file
  const fileKey = useMemo(() => {
    if (!file) return 'empty';
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, [file]);

  // Reset ready state quando cambia file
  useEffect(() => {
    setIsReady(false);
  }, [fileKey]);

  if (!file) return null;

  return (
    <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-950 relative rounded-2xl overflow-hidden">
      
      <Canvas
        key={fileKey}
        shadows
        dpr={[1, 2]}
        camera={{ 
          position: [0, 0, 100], 
          fov: 50,
          near: 0.1,
          far: 10000 
        }}
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        style={{ cursor: 'grab' }}
      >
        {/* Sfondo scuro */}
        <color attach="background" args={['#1a1a1e']} />
        
        {/* Illuminazione */}
        <Lights />
        
        {/* Modello 3D */}
        <SceneContent 
          file={file} 
          onLoaded={() => setIsReady(true)}
          onError={() => setIsReady(false)}
        />
        
        {/* Controlli camera - SOLO ROTAZIONE + ZOOM */}
        <OrbitControls 
          makeDefault
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={500}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
        />
      </Canvas>

      {/* Overlay nome file - STATO FISSO (senza animate-pulse) */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono flex items-center gap-2 shadow-lg">
          <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="truncate max-w-[200px]">{file.name}</span>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-white/20 text-[10px] uppercase font-bold tracking-widest">
        Mimesi 3D Viewer
      </div>
    </div>
  );
}