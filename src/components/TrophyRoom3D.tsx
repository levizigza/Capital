import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Trophy({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[0.3, 0.8, 32]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
  )
}

const TrophyRoom3D = ({ trophies }: { trophies: Array<{ color: string }> }) => (
  <Canvas style={{ width: "100%", height: "350px" }}>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    {trophies.map((trophy, idx) => (
      <Trophy key={idx} position={[(idx - 1) * 2, 0, 0]} color={trophy.color} />
    ))}
  </Canvas>
)

export default TrophyRoom3D
