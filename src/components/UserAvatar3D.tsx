import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Avatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

const UserAvatar3D = ({ avatarColor }: { avatarColor: string }) => (
  <Canvas style={{ width: "200px", height: "250px" }}>
    <ambientLight />
    <pointLight position={[5, 5, 5]} />
    <Avatar color={avatarColor} />
  </Canvas>
)

export default UserAvatar3D
