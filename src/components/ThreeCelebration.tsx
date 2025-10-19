import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Firework({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y += 0.05
      meshRef.current.scale.x += 0.02
      meshRef.current.scale.z += 0.02
      if (meshRef.current.position.y > 5) {
        meshRef.current.position.y = 0
        meshRef.current.scale.set(1, 1, 1)
      }
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#ff6b6b" emissive="#ff0000" emissiveIntensity={2} />
    </mesh>
  )
}

const ThreeCelebration = () => (
  <Canvas style={{ width: "100%", height: "300px" }}>
    <ambientLight />
    <Firework position={[-2, 0, 0]} />
    <Firework position={[0, 0, 0]} />
    <Firework position={[2, 0, 0]} />
  </Canvas>
)

export default ThreeCelebration
