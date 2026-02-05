import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export interface ElementData {
    name: string;
    symbol: string;
    number: number;
    xpos: number;
    ypos: number;
    category: string;
    cpk_hex: string | null;
    atomic_mass: number;
    phase: string;
    block: string;
    summary: string;
    melt: number | null;
    boil: number | null;
    density: number | null;
    electronegativity_pauling: number | null;
    ionization_energies: number[];
    electron_affinity: number | null;
}

export type ColorMode = 'category' | 'phase' | 'block' | 'cpk' | 'atomic_mass' | 'density' | 'electronegativity' | 'ionization' | 'electron_affinity';

const categoryColors: Record<string, string> = {
    "diatomic nonmetal": "#00f2ff",
    "noble gas": "#bf00ff",
    "alkali metal": "#ff0055",
    "alkaline earth metal": "#ffaa00",
    "metalloid": "#00ff88",
    "polyatomic nonmetal": "#00ccff",
    "post-transition metal": "#5de2ff",
    "transition metal": "#ffea00",
    "lanthanide": "#ff00ff",
    "actinide": "#ff5500",
};

const phaseColors: Record<string, string> = {
    "Gas": "#ff00ff",
    "Solid": "#00f2ff",
    "Liquid": "#00ff88",
    "Unknown": "#444444",
};

const blockColors: Record<string, string> = {
    "s": "#ff0055",
    "p": "#00f2ff",
    "d": "#ffea00",
    "f": "#bf00ff",
};

const interpolateColor = (val: number, min: number, max: number, colorLow: string, colorHigh: string) => {
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const c1 = new THREE.Color(colorLow);
    const c2 = new THREE.Color(colorHigh);
    const mixedLow = c1.clone().add(new THREE.Color("#111122"));
    return mixedLow.lerp(c2, t).getStyle();
};

export function ElementBlock({
    element,
    hoveredElementId,
    setHoveredElementId,
    selectedElementId,
    setSelectedElementId,
    colorMode,
    ranges
}: {
    element: ElementData;
    hoveredElementId: number | null;
    setHoveredElementId: (n: number | null) => void;
    selectedElementId: number | null;
    setSelectedElementId: (n: number | null) => void;
    colorMode: ColorMode;
    ranges: Record<string, [number, number]>;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Use state to track touch capability more reliably
    const [hasMouse, setHasMouse] = useState(false);
    useEffect(() => {
        setHasMouse(window.matchMedia("(pointer: fine)").matches);
    }, []);

    const isSelected = selectedElementId === element.number;
    const isHovered = hoveredElementId === element.number;
    const isEffectivelyActive = isSelected || isHovered;

    const position: [number, number, number] = [
        (element.xpos - 9) * 1.3,
        (5 - element.ypos) * 1.3,
        0
    ];

    const color = useMemo(() => {
        switch (colorMode) {
            case 'category': return categoryColors[element.category] || "#444444";
            case 'phase': return phaseColors[element.phase] || "#444444";
            case 'block': return blockColors[element.block] || "#444444";
            case 'cpk': return element.cpk_hex ? `#${element.cpk_hex}` : "#444444";
            case 'atomic_mass':
                return interpolateColor(element.atomic_mass, ranges.atomic_mass[0], ranges.atomic_mass[1], "#222244", "#e94560");
            case 'density':
                return interpolateColor(element.density || 0, ranges.density[0], ranges.density[1], "#222244", "#00d2ff");
            case 'electronegativity':
                return interpolateColor(element.electronegativity_pauling || 0, ranges.electronegativity[0], ranges.electronegativity[1], "#222244", "#f9d423");
            case 'ionization':
                return interpolateColor(element.ionization_energies[0] || 0, ranges.ionization[0], ranges.ionization[1], "#222244", "#a8ff78");
            case 'electron_affinity':
                return interpolateColor(element.electron_affinity || 0, ranges.electron_affinity[0], ranges.electron_affinity[1], "#222244", "#ff0080");
            default: return "#ffffff";
        }
    }, [colorMode, element, ranges]);

    useFrame(() => {
        if (meshRef.current) {
            const targetZ = isEffectivelyActive ? 0.6 : 0;
            const targetScale = isEffectivelyActive ? 1.15 : 1;
            meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
        }
    });

    return (
        <group position={position}>
            <RoundedBox
                ref={meshRef}
                args={[1.1, 1.1, 1.1]}
                radius={0.12}
                smoothness={4}
                onClick={(e) => {
                    e.stopPropagation();
                    const newId = isSelected ? null : element.number;
                    setSelectedElementId(newId);
                    // Clear hover state on click so the lock is immediate and clean
                    setHoveredElementId(null);
                }}
                onPointerOver={(e) => {
                    // Only trigger hover if no element is currently locked (selected)
                    if (hasMouse && !selectedElementId) {
                        e.stopPropagation();
                        setHoveredElementId(element.number);
                    }
                }}
                onPointerOut={() => {
                    if (hasMouse) {
                        setHoveredElementId(null);
                    }
                }}
            >
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isEffectivelyActive ? 1.2 : 0.25}
                    metalness={0.9}
                    roughness={0.1}
                />

                {/* Atomic Number */}
                <Text
                    position={[-0.4, 0.4, 0.56]}
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {element.number}
                </Text>

                {/* Symbol */}
                <Text
                    position={[0, 0.05, 0.56]}
                    fontSize={0.45}
                    color="white"
                    fontWeight="bold"
                    anchorX="center"
                    anchorY="middle"
                >
                    {element.symbol}
                </Text>

                {/* Name */}
                <Text
                    position={[0, -0.38, 0.56]}
                    fontSize={0.1}
                    color="white"
                    fillOpacity={0.9}
                    anchorX="center"
                    anchorY="middle"
                >
                    {element.name}
                </Text>
            </RoundedBox>

            {isEffectivelyActive && (
                <pointLight color={color} intensity={10} distance={4} position={[0, 0, 1.5]} />
            )}
        </group>
    );
}
