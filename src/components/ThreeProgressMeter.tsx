import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ProgressBar({ percent }: { percent: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })
  
  const clampedPercent = Math.max(0, Math.min(100, percent))
  const height = (clampedPercent / 100) * 2
  
  return (
    <mesh ref={meshRef} position={[0, height / 2, 0]}>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

const ThreeProgressMeter = ({ percent }: { percent: number }) => (
  <Canvas style={{ width: "100%", height: "200px" }}>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} intensity={1} />
    <ProgressBar percent={percent} />
  </Canvas>
)

export default ThreeProgressMeter
