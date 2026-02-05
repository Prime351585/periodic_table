import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Stars } from '@react-three/drei';
import { ElementBlock, type ElementData, type ColorMode } from './ElementBlock.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const propertyConfigs: Record<string, { label: string, low: string, high: string }> = {
    atomic_mass: { label: 'Atomic Mass', low: "#1a1a2e", high: "#e94560" },
    density: { label: 'Density', low: "#1a1a2e", high: "#00d2ff" },
    electronegativity: { label: 'Electronegativity', low: "#1a1a2e", high: "#f9d423" },
    ionization: { label: 'Ionization Enthalpy', low: "#1a1a2e", high: "#a8ff78" },
    electron_affinity: { label: 'Electron Affinity', low: "#1a1a2e", high: "#ff0080" },
};

export default function PeriodicTableScene() {
    const [elements, setElements] = useState<ElementData[]>([]);
    const [hoveredElementId, setHoveredElementId] = useState<number | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
    const [colorMode, setColorMode] = useState<ColorMode>('category');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const controlsRef = useRef<any>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetch('/PeriodicTableJSON.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const mappedElements = data.elements.map((el: any) => ({
                    ...el,
                    cpk_hex: el['cpk-hex']
                }));
                setElements(mappedElements);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading periodic table data:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const ranges = useMemo(() => {
        if (elements.length === 0) return {};
        const result: any = {};

        result.atomic_mass = [
            Math.min(...elements.map(e => e.atomic_mass)),
            Math.max(...elements.map(e => e.atomic_mass))
        ];
        result.density = [
            Math.min(...elements.filter(e => e.density !== null).map(e => e.density!)),
            Math.max(...elements.filter(e => e.density !== null).map(e => e.density!))
        ];
        result.electronegativity = [
            Math.min(...elements.filter(e => e.electronegativity_pauling !== null).map(e => e.electronegativity_pauling!)),
            Math.max(...elements.filter(e => e.electronegativity_pauling !== null).map(e => e.electronegativity_pauling!))
        ];
        result.ionization = [
            Math.min(...elements.filter(e => e.ionization_energies.length > 0).map(e => e.ionization_energies[0])),
            Math.max(...elements.filter(e => e.ionization_energies.length > 0).map(e => e.ionization_energies[0]))
        ];
        result.electron_affinity = [
            Math.min(...elements.filter(e => e.electron_affinity !== null).map(e => e.electron_affinity!)),
            Math.max(...elements.filter(e => e.electron_affinity !== null).map(e => e.electron_affinity!))
        ];

        return result;
    }, [elements]);

    const activeElementId = hoveredElementId || selectedElementId;

    const displayElement = useMemo(() =>
        elements.find(e => e.number === activeElementId),
        [elements, activeElementId]
    );

    const activeProperty = propertyConfigs[colorMode];

    const resetScene = () => {
        setSelectedElementId(null);
        setHoveredElementId(null);
        setColorMode('category');
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ background: '#050510', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
                <div style={{ fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center' }}>LOADING ELEMENTS...</div>
            </div>
        );
    }

    return (
        <div
            style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#020205', overflow: 'hidden' }}
            onClick={() => {
                if (showDropdown) setShowDropdown(false);
            }}
        >
            {/* 3D Scene */}
            <Canvas
                shadows dpr={[1, 2]}
                onPointerMissed={() => {
                    setSelectedElementId(null);
                    setHoveredElementId(null);
                }}
            >
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 100]}
                    zoom={isMobile ? 18 : 40}
                    near={-1000}
                    far={1000}
                />
                <color attach="background" args={['#020205']} />

                <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={false}
                    minZoom={10}
                    maxZoom={100}
                    mouseButtons={{
                        LEFT: THREE.MOUSE.PAN,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.PAN
                    }}
                    touches={{
                        ONE: THREE.TOUCH.PAN,
                        TWO: THREE.TOUCH.DOLLY_PAN
                    }}
                    makeDefault
                />

                <ambientLight intensity={0.5} />
                <pointLight position={[20, 20, 20]} intensity={2} color="#ffffff" />
                <pointLight position={[-20, 20, 20]} intensity={1.5} color="#44aaff" />
                <directionalLight position={[0, 10, 10]} intensity={1.5} />

                <Suspense fallback={null}>
                    <group position={[0, isMobile ? 0 : 0.5, 0]} scale={isMobile ? 0.8 : 1}>
                        {elements.map((element) => (
                            <ElementBlock
                                key={element.number}
                                element={element}
                                hoveredElementId={hoveredElementId}
                                setHoveredElementId={setHoveredElementId}
                                selectedElementId={selectedElementId}
                                setSelectedElementId={setSelectedElementId}
                                colorMode={colorMode}
                                ranges={ranges}
                            />
                        ))}
                    </group>
                    <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
            </Canvas>

            {/* Overlay UI: Title */}
            <div className="overlay-title" style={{ top: '20px', left: isMobile ? '20px' : '50%', transform: isMobile ? 'translateX(0)' : 'translateX(-50%)' }}>
                <h1 style={{ opacity: 0.1, fontSize: isMobile ? '2rem' : '4rem' }}>
                    PERIODIC {isMobile ? <br /> : ' '} TABLE
                </h1>
            </div>

            {/* Reset Button & Dropdown Group */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '12px'
                }}
            >
                {/* Reset Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetScene}
                    style={{
                        padding: '10px 16px',
                        background: 'rgba(255, 50, 50, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 50, 50, 0.2)',
                        borderRadius: '12px',
                        color: '#ff6666',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 0 0-5 5h2L2 11 0 8h2a6 6 0 1 1 1.085 3.415l1.415-1.415A4 4 0 1 0 8 3z" />
                    </svg>
                    Reset
                </motion.button>

                {/* Filter Dropdown */}
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <div
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            padding: '12px 24px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            userSelect: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>
                            {colorMode.replace('_', ' ')}
                        </span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.3s', pointerEvents: 'none' }}>
                            <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: '240px',
                                    background: 'rgba(10, 10, 20, 0.8)',
                                    backdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '20px',
                                    padding: '12px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                    overflow: 'hidden'
                                }}
                            >
                                {[
                                    { label: 'General', items: ['category', 'phase', 'block', 'cpk'] },
                                    { label: 'Periodic Trends', items: ['atomic_mass', 'density', 'electronegativity', 'ionization', 'electron_affinity'] }
                                ].map((group, idx) => (
                                    <div key={idx} style={{ marginBottom: idx === 0 ? '12px' : 0 }}>
                                        <div style={{ padding: '4px 12px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                            {group.label}
                                        </div>
                                        {group.items.map((item) => (
                                            <div
                                                key={item}
                                                onClick={() => {
                                                    setColorMode(item as ColorMode);
                                                    setShowDropdown(false);
                                                }}
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: '10px',
                                                    color: colorMode === item ? '#00f2ff' : 'white',
                                                    background: colorMode === item ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    transition: '0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                {item.replace('_', ' ')}
                                                {colorMode === item && <div style={{ width: 6, height: 6, background: '#00f2ff', borderRadius: '50%' }} />}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Property Legend */}
            <AnimatePresence>
                {activeProperty && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{
                            position: 'absolute',
                            bottom: isMobile ? 'auto' : '150px',
                            top: isMobile ? '120px' : 'auto',
                            left: isMobile ? '20px' : '40px',
                            padding: '20px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '24px',
                            zIndex: 10,
                            width: '200px'
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            Trend: {activeProperty.label}
                        </div>
                        <div style={{
                            height: '10px',
                            width: '100%',
                            background: `linear-gradient(to right, ${activeProperty.low}, ${activeProperty.high})`,
                            borderRadius: '100px',
                            marginBottom: '8px'
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'white', fontFamily: 'monospace' }}>
                            <span>{ranges[colorMode]?.[0]?.toFixed(1)}</span>
                            <span>{ranges[colorMode]?.[1]?.toFixed(1)}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Element Details Card */}
            <AnimatePresence mode="wait">
                {displayElement && (
                    <motion.div
                        key={displayElement.number}
                        initial={{ opacity: 0, x: isMobile ? 0 : (displayElement.xpos > 9 ? -20 : 20), y: isMobile ? 100 : 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: isMobile ? 0 : (displayElement.xpos > 9 ? -20 : 20), y: isMobile ? 100 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="element-details no-scrollbar"
                        style={{
                            pointerEvents: 'auto',
                            left: !isMobile && displayElement.xpos > 9 ? '40px' : (isMobile ? '0' : 'auto'),
                            right: !isMobile && displayElement.xpos <= 9 ? '40px' : (isMobile ? '0' : 'auto')
                        }}
                    >
                        <div className={`details-scroll-container no-scrollbar`}>
                            <div className="details-header">
                                <div>
                                    <span className="atomic-number">#{displayElement.number}</span>
                                    <h2 className="element-name">{displayElement.name}</h2>
                                    <p className="element-symbol" style={{ color: '#00f2ff' }}>{displayElement.symbol}</p>
                                </div>
                                <div className="category-badge">
                                    {displayElement.category}
                                </div>
                            </div>

                            <p className="element-summary">
                                {displayElement.summary}
                            </p>

                            <div className="stats-grid">
                                {[
                                    { label: 'Atomic Mass', val: `${displayElement.atomic_mass.toFixed(2)} u` },
                                    { label: 'Phase', val: displayElement.phase },
                                    { label: 'Melt/Boil', val: `${displayElement.melt ?? 'N/A'}K / ${displayElement.boil ?? 'N/A'}K` },
                                    { label: 'Density', val: displayElement.density ?? 'N/A' },
                                    { label: 'Electronegativity', val: displayElement.electronegativity_pauling ?? 'N/A' },
                                    { label: 'Ionization', val: displayElement.ionization_energies[0] ?? 'N/A' }
                                ].map((stat, i) => (
                                    <div key={i} className="stat-card">
                                        <div className="stat-label">{stat.label}</div>
                                        <div className="stat-value">{stat.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Social Links */}
            <div
                style={{
                    position: 'absolute',
                    bottom: isMobile ? '70px' : '100px', // Higher than instructions
                    left: isMobile ? '20px' : '40px',
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '12px',
                    zIndex: 15, // Lower than element-details card (z-index: 20)
                    pointerEvents: 'auto'
                }}
            >
                {[
                    {
                        name: 'Github',
                        url: 'https://github.com/prime351585',
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                        )
                    },
                    {
                        name: 'Twitter',
                        url: 'https://x.com/HarshMaurya1585',
                        icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                        )
                    },
                    {
                        name: 'Peerlist',
                        url: 'https://peerlist.io/prime351585',
                        icon: (
                            <img
                                src="https://private-user-images.githubusercontent.com/88525844/285455675-322e4391-487a-45d8-88c2-45155d9918fd.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzAyNzM4MjQsIm5iZiI6MTc3MDI3MzUyNCwicGF0aCI6Ii84ODUyNTg0NC8yODU0NTU2NzUtMzIyZTQzOTEtNDg3YS00NWQ4LTg4YzItNDUxNTVkOTkxOGZkLnN2Zz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjAyMDUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwMjA1VDA2Mzg0NFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWE1OGVlYzlhYjliZWJjNmIyZmQ2YTNkOGI2ZmI1YWIzNzIzYTZjZjExNTYxNTU3N2EyYTQ5MDBkZWEwYmQ3YzYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.nV2kSCEahXcF9YjedALDKGBvoaTGMyRDQRavWu4DwUA"
                                alt="Peerlist"
                                style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }}
                            />
                        )
                    }
                ].map((social) => (
                    <motion.a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '44px',
                            height: '44px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                        }}
                    >
                        {social.icon}
                    </motion.a>
                ))}
            </div>

            <div className="instructions" style={{ bottom: '20px', left: isMobile ? '20px' : '40px', fontSize: '0.6rem', opacity: 0.3 }}>
                {isMobile ? 'Pinch to Zoom • One Finger Pan • Tap to Inspect' : 'Drag to Orbit • Scroll to Zoom'}
            </div>
        </div>
    );
}
