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
  <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: '#f0f9ff', borderRadius: 24, boxShadow: '0 4px 32px #bae6fd', padding: 24, marginBottom: 32 }}>
    <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 28, color: '#2563eb', marginBottom: 12 }}>Finance Garden</h2>
    <Canvas style={{ width: '100%', height: '320px', background: '#fff', borderRadius: 16 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <Plant position={[-2,0,0]} scale={[1+savings/100,1,1]} color="#3ba935" />
      <Plant position={[0,0,0]} scale={[1+investments/100,1,1]} color="#3b56a9" />
      <Plant position={[2,0,0]} scale={[1+credit/100,1,1]} color="#a97d3b" />
    </Canvas>
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
      <span style={{ color: '#3ba935', fontWeight: 700 }}>Savings: {savings}</span>
      <span style={{ color: '#3b56a9', fontWeight: 700 }}>Investments: {investments}</span>
      <span style={{ color: '#a97d3b', fontWeight: 700 }}>Credit: {credit}</span>
    </div>
  </div>
)

export default ThreeFinanceGarden
