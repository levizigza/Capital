import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'

interface RegionProps {
  position: [number, number, number]
  color: string
  name: string
  onClick: () => void
}

function Region({ position, color, name, onClick }: RegionProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color={hovered ? '#ffff00' : color} metalness={0.4} roughness={0.6} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
        {name}
      </Text>
    </group>
  )
}

interface FinanceWorldMap3DProps {
  onRegionClick: (region: string) => void
}

const FinanceWorldMap3D = ({ onRegionClick }: FinanceWorldMap3DProps) => (
  <Canvas style={{ width: "100%", height: "500px" }} camera={{ position: [0, 5, 8], fov: 50 }}>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <Region position={[-3, 0, 0]} color="#2ecc71" name="Savings Forest" onClick={() => onRegionClick("savings")} />
    <Region position={[0, 0, 0]} color="#3498db" name="Investment Island" onClick={() => onRegionClick("investing")} />
    <Region position={[3, 0, 0]} color="#e74c3c" name="Credit Canyon" onClick={() => onRegionClick("credit")} />
    <Region position={[0, 0, -3]} color="#f39c12" name="Budget Bay" onClick={() => onRegionClick("budget")} />
    <OrbitControls enableZoom={true} enablePan={true} />
  </Canvas>
)

export default FinanceWorldMap3D
