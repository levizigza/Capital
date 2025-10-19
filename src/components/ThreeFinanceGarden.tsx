import React from 'react'
import { Canvas } from '@react-three/fiber'

function Plant({ position, scale, color }: { position: [number, number, number], scale: [number, number, number], color: string }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const ThreeFinanceGarden = ({ savings, investments, credit }: { savings: number, investments: number, credit: number }) => (
  <Canvas style={{ width: "100%", height: "400px" }}>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    {/* Example usage: */}
    <Plant position={[-2,0,0]} scale={[1+savings/100,1,1]} color="#3ba935" />
    <Plant position={[0,0,0]} scale={[1+investments/100,1,1]} color="#3b56a9" />
    <Plant position={[2,0,0]} scale={[1+credit/100,1,1]} color="#a97d3b" />
  </Canvas>
)

export default ThreeFinanceGarden
