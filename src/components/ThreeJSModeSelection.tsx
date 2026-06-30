import { useRef, useState, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars, MeshDistortMaterial, Environment, PerspectiveCamera, useProgress, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import type { LearningMode } from '@/App'

// Loading component
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white text-xl font-bold">{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

// Floating coin component
function FloatingCoin({ position, delay = 0, color = '#FFD700' }: { position: [number, number, number], delay?: number, color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.3
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </mesh>
      {/* Dollar sign on coin */}
      <mesh position={[position[0], position[1], position[2] + 0.06]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  )
}

// Animated piggy bank
function AnimatedPiggyBank({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#FF69B4"
          speed={2}
          distort={0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Snout */}
      <mesh position={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="#FFB6C1" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.3, 0.6, 0.3]} rotation={[0.3, 0, -0.3]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color="#FF69B4" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 0.6, -0.3]} rotation={[-0.3, 0, -0.3]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color="#FF69B4" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Coin slot */}
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.4, 0.15]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Floating dollar signs
function FloatingDollarSign({ position, delay = 0 }: { position: [number, number, number], delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + delay) * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.3, 0.08, 16, 32]} />
        <meshStandardMaterial
          color="#00FF00"
          metalness={0.6}
          roughness={0.2}
          emissive="#00FF00"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  )
}

// Animated chart bars
function ChartBars({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const heights = [0.5, 0.8, 0.4, 1.0, 0.7]
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const targetHeight = heights[i] * (1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2)
        child.scale.y = THREE.MathUtils.lerp(child.scale.y, targetHeight, 0.1)
      })
    }
  })
  
  return (
    <group ref={groupRef} position={position}>
      {heights.map((h, i) => (
        <mesh key={i} position={[(i - 2) * 0.4, h / 2, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial
            color={colors[i]}
            metalness={0.4}
            roughness={0.3}
            emissive={colors[i]}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Scene background with particles
function SceneBackground() {
  const particlesRef = useRef<THREE.Points>(null!)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    const colors = new Float32Array(500 * 3)
    
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      
      // Gold and green colors
      const isGold = Math.random() > 0.5
      colors[i * 3] = isGold ? 1 : 0.2
      colors[i * 3 + 1] = isGold ? 0.84 : 1
      colors[i * 3 + 2] = isGold ? 0 : 0.2
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={500}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={500}
          array={particles.colors}
          itemSize={3}
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.6} />
    </points>
  )
}

// Main 3D scene
function Scene3D() {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(0, 0, 10)
  }, [camera])
  
  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 8, 30]} />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00FF00" />
      <spotLight
        position={[0, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#fff"
      />
      
      <SceneBackground />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating coins around the scene */}
      <FloatingCoin position={[-5, 2, -2]} delay={0} />
      <FloatingCoin position={[5, -1, -3]} delay={1} color="#C0C0C0" />
      <FloatingCoin position={[-3, -2, -1]} delay={2} />
      <FloatingCoin position={[4, 3, -2]} delay={3} color="#CD7F32" />
      <FloatingCoin position={[0, 4, -4]} delay={4} />
      
      {/* Piggy bank */}
      <AnimatedPiggyBank position={[-4, 0, 2]} />
      
      {/* Chart bars */}
      <ChartBars position={[4, -1, 2]} />
      
      {/* Dollar signs */}
      <FloatingDollarSign position={[-2, 3, 0]} delay={0} />
      <FloatingDollarSign position={[3, 2, -1]} delay={1.5} />
      
      <Environment preset="city" />
    </>
  )
}

// Main component with UI overlay
interface ThreeJSModeSelectionProps {
  onSelectMode: (mode: LearningMode) => void
}

export default function ThreeJSModeSelection({ onSelectMode }: ThreeJSModeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<'creative' | 'structured' | 'islands' | null>(null)
  const islandsEnabled = import.meta.env.VITE_ISLANDS === '1'
  
  useEffect(() => {
    // Give the 3D scene a moment to load
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
          <Scene3D />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full flex flex-col items-center justify-center p-4 sm:p-8"
            >
              {/* Title */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
                className="text-center mb-8 sm:mb-12"
              >
                <div className="flex flex-col items-center">
                  <h1 className="capital-logo text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
                    <span className="capital-logo-coin"><span>$</span></span>
                    Capital
                  </h1>
                  <p className="capital-logo-tagline text-base sm:text-lg md:text-xl mt-2">
                    Master Your Money
                  </p>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-6 font-medium"
                >
                  Choose your adventure and start learning!
                </motion.p>
              </motion.div>
              
              {/* Mode Selection Cards */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 pointer-events-auto max-w-4xl w-full px-4">
                {/* Creative Mode Card */}
                <motion.button
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredCard('creative')}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => onSelectMode('creative')}
                  className={`flex-1 p-6 sm:p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 cursor-pointer group
                    ${hoveredCard === 'creative' 
                      ? 'bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-green-400 shadow-[0_0_60px_rgba(34,197,94,0.5)]' 
                      : 'bg-white/10 border-white/20 hover:border-green-400/50'}`}
                >
                  <div className="text-6xl sm:text-7xl mb-4 transform group-hover:scale-110 transition-transform">
                    🌱
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Creative Mode</h2>
                  <p className="text-base sm:text-lg text-green-300 font-semibold mb-3">Finance Garden</p>
                  <p className="text-sm sm:text-base text-gray-300">
                    Explore a 3D world, grow your wealth, battle bosses, and watch your financial garden bloom!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['🎮 Games', '🗺️ Explore', '👾 Bosses'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-green-500/30 text-green-200 text-xs sm:text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.button>
                
                {/* Structured Mode Card */}
                <motion.button
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredCard('structured')}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => onSelectMode('structured')}
                  className={`flex-1 p-6 sm:p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 cursor-pointer group
                    ${hoveredCard === 'structured' 
                      ? 'bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-blue-400 shadow-[0_0_60px_rgba(59,130,246,0.5)]' 
                      : 'bg-white/10 border-white/20 hover:border-blue-400/50'}`}
                >
                  <div className="text-6xl sm:text-7xl mb-4 transform group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Structured Mode</h2>
                  <p className="text-base sm:text-lg text-blue-300 font-semibold mb-3">Analytics Dashboard</p>
                  <p className="text-sm sm:text-base text-gray-300">
                    Track progress with charts, complete quests, and level up your financial skills!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['📈 Charts', '🎯 Quests', '🏆 Levels'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs sm:text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.button>

                {islandsEnabled ? (
                  <motion.button
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.85, type: 'spring' }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredCard('islands')}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => onSelectMode('islands')}
                    data-testid="mode-islands"
                    className={`flex-1 p-6 sm:p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 cursor-pointer group
                      ${hoveredCard === 'islands'
                        ? 'bg-gradient-to-br from-amber-500/30 to-orange-600/30 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.5)]'
                        : 'bg-white/10 border-white/20 hover:border-amber-400/50'}`}
                  >
                    <div className="text-6xl sm:text-7xl mb-4 transform group-hover:scale-110 transition-transform">
                      🏝️
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Island Adventure</h2>
                    <p className="text-base sm:text-lg text-amber-300 font-semibold mb-3">Beta</p>
                    <p className="text-sm sm:text-base text-gray-300">
                      Explore a travel map, talk to NPCs, find items, and complete quests.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['🧭 Travel', '💬 NPCs', '🎒 Items'].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ) : null}
              </div>
              
              {/* Footer hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-gray-400 text-sm mt-8 text-center max-w-lg px-2"
              >
                ✨ Tip: Use <strong className="text-gray-300">Home</strong> from the top of Creative or Structured mode to return here and switch paths anytime.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
