import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Grid, PerspectiveCamera, Html } from '@react-three/drei';
import { Layers, RefreshCw, Sun, Box as BoxIcon, Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface ThreeDViewerProps {
    modelUrl?: string;
    className?: string;
}

// --- Scene Components ---

const LoadedModel = ({ url, wireframe }: { url: string, wireframe: boolean }) => {
    const { scene } = useGLTF(url);
    // Apply wireframe to all meshes in the loaded model
    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material.wireframe = wireframe;
            }
        });
    }, [scene, wireframe]);
    
    return <primitive object={scene} />;
};

const ProceduralTurbine = ({ wireframe }: { wireframe: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (groupRef.current) {
            const blades = groupRef.current.getObjectByName('blades');
            if (blades) blades.rotation.z -= delta * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Tower */}
            <mesh position={[0, 4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.6, 8, 32]} />
                <meshStandardMaterial color="#333" roughness={0.5} wireframe={wireframe} />
            </mesh>

            {/* Nacelle */}
            <mesh position={[0, 8.2, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 1, 1]} />
                <meshStandardMaterial color="#444" roughness={0.5} wireframe={wireframe} />
            </mesh>

            {/* Hub & Blades Group */}
            <group name="blades" position={[0, 8.2, 0.8]}>
                {/* Hub */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <coneGeometry args={[0.4, 0.8, 32]} />
                    <meshStandardMaterial color="#eee" wireframe={wireframe} />
                </mesh>

                {/* 3 Blades */}
                {[0, 1, 2].map((i) => (
                    <mesh 
                        key={i} 
                        rotation={[0, 0, (i * Math.PI * 2) / 3]} 
                        position={[0, 0, 0]}
                        castShadow receiveShadow
                    >
                        <group position={[0, 2.5, 0]}> {/* Pivot correction */}
                            <mesh scale={[1, 1, 0.2]}>
                                <boxGeometry args={[0.3, 5, 0.1]} />
                                <meshStandardMaterial color="#fff" wireframe={wireframe} />
                            </mesh>
                        </group>
                    </mesh>
                ))}
            </group>

            {/* Base */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <cylinderGeometry args={[2, 2.2, 0.2, 32]} />
                <meshStandardMaterial color="#222" wireframe={wireframe} />
            </mesh>
        </group>
    );
};

const TurbineModel = ({ wireframe, modelUrl }: { wireframe: boolean, modelUrl?: string }) => {
    if (modelUrl) {
        return <LoadedModel url={modelUrl} wireframe={wireframe} />;
    }
    return <ProceduralTurbine wireframe={wireframe} />;
};

const CameraController = ({ resetTrigger }: { resetTrigger: number }) => {
    const { camera, controls } = useThree();
    
    useEffect(() => {
        // Reset camera position
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 5, 0);
        // @ts-ignore
        if (controls) controls.target.set(0, 5, 0);
    }, [resetTrigger, camera, controls]);

    return null;
};

// --- Main Component ---

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ modelUrl, className }) => {
    const [wireframe, setWireframe] = useState(false);
    const [intensity, setIntensity] = useState(1);
    const [resetCount, setResetCount] = useState(0);

    return (
        <div className={`relative w-full h-full bg-[#050505] overflow-hidden rounded-xl border border-primary-dim ${className}`}>
            {/* Toolbar */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <div className="bg-background-panel/90 backdrop-blur border border-primary-dim rounded-lg p-2 flex flex-col gap-2 shadow-xl">
                    <button 
                        onClick={() => setWireframe(!wireframe)}
                        className={`p-2 rounded transition-colors flex items-center gap-2 text-xs font-bold ${wireframe ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted hover:text-white hover:bg-white/10'}`}
                        title="Toggle Wireframe"
                    >
                        <Layers className="w-4 h-4" />
                        <span className="hidden md:inline">WIREFRAME</span>
                    </button>
                    
                    <div className="h-px bg-white/10 my-1"></div>

                    <div className="px-2 py-1">
                        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                            <Sun className="w-3 h-3" />
                            <span>LIGHTING</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="3" 
                            step="0.1" 
                            value={intensity} 
                            onChange={(e) => setIntensity(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="h-px bg-white/10 my-1"></div>

                    <button 
                        onClick={() => setResetCount(c => c + 1)}
                        className="p-2 rounded text-text-muted hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
                        title="Reset Camera"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden md:inline">RESET VIEW</span>
                    </button>
                </div>
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <div className="text-primary font-mono text-xl font-bold flex items-center gap-2">
                        <BoxIcon className="w-5 h-5" />
                        DIGITAL TWIN
                    </div>
                    <div className="text-xs text-text-muted font-mono bg-black/50 px-2 py-1 rounded backdrop-blur">
                        MODEL: WTG-048-TURBINE-V2<br/>
                        SOURCE: LIVE TELEMETRY<br/>
                        STATUS: SYNCED
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
                <CameraController resetTrigger={resetCount} />
                
                <OrbitControls 
                    makeDefault 
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 1.8} 
                    target={[0, 5, 0]}
                />

                <ambientLight intensity={0.5 * intensity} />
                <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1 * intensity} 
                    castShadow 
                    shadow-mapSize={[1024, 1024]} 
                />
                <spotLight 
                    position={[-10, 20, -5]} 
                    intensity={0.5 * intensity} 
                    angle={0.5} 
                    penumbra={1} 
                />

                <Suspense fallback={<Html center><Loader2 className="w-8 h-8 text-primary animate-spin" /></Html>}>
                    <Stage environment="city" intensity={0.5 * intensity} adjustCamera={false}>
                        <TurbineModel wireframe={wireframe} modelUrl={modelUrl} />
                    </Stage>
                    <Grid 
                        renderOrder={-1} 
                        position={[0, 0, 0]} 
                        infiniteGrid 
                        cellSize={1} 
                        sectionSize={5} 
                        sectionColor="#06f9f9" 
                        cellColor="#1a1a1a" 
                        fadeDistance={50} 
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
