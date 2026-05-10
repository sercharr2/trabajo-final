import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls, Text, Bounds, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Renderiza un teclado 3D con react-three-fiber.
 * - Teclas estándar (1u): instancian el modelo blankkeycap.glb
 * - Teclas anchas (Space, Shift, Enter, etc.): box redondeado para evitar
 *   que el modelo se estire de forma fea.
 *
 * Controles:
 *   - Click izq: rotar
 *   - Ctrl + click izq: mover (pan)
 *   - Scroll: zoom
 */

useGLTF.preload('/blankkeycap.glb')

const KEY_SCALE = 0.92
const WIDE_THRESHOLD = 1.4

// ─── Tecla estandar (modelo GLB) ──────────────────────────────────────
function StandardKey({ color, modelScale }) {
  const { scene } = useGLTF('/blankkeycap.glb')
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.color = new THREE.Color(color || '#2a2a3a')
        child.material.metalness = 0.05
        child.material.roughness = 0.55
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return c
  }, [scene, color])

  const s = modelScale * KEY_SCALE
  return <primitive object={cloned} scale={[s, s, s]} />
}

// ─── Tecla ancha: caja redondeada con tapa ────────────────────────────
function WideKey({ keyData, color, modelScale }) {
  const w = keyData.w * KEY_SCALE * modelScale
  const h = keyData.h * KEY_SCALE * modelScale
  const height = modelScale * 0.55

  return (
    <group position={[0, height / 2, 0]}>
      {/* Cuerpo principal */}
      <RoundedBox
        args={[w, height, h]}
        radius={modelScale * 0.06}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color || '#2a2a3a'} metalness={0.05} roughness={0.5} />
      </RoundedBox>
      {/* Cara superior elevada */}
      <RoundedBox
        args={[w * 0.92, modelScale * 0.05, h * 0.85]}
        radius={modelScale * 0.05}
        smoothness={4}
        position={[0, height / 2 + modelScale * 0.005, 0]}
      >
        <meshStandardMaterial color={color || '#2a2a3a'} metalness={0.1} roughness={0.45} />
      </RoundedBox>
    </group>
  )
}

// ─── Wrapper que decide qué render usar y aplica animación ────────────
function Keycap({ keyData, color, textColor, label, isSelected, onSelect, showLabels, modelScale }) {
  const ref = useRef()
  const useWideBox = keyData.w >= WIDE_THRESHOLD || keyData.h >= WIDE_THRESHOLD

  useFrame((state) => {
    if (ref.current) {
      const targetY = isSelected
        ? 0.04 + Math.sin(state.clock.elapsedTime * 4) * 0.005
        : 0
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.15)
    }
  })

  const cx = keyData.x + keyData.w / 2
  const cz = keyData.y + keyData.h / 2

  return (
    <group
      ref={ref}
      position={[cx, 0, cz]}
      onClick={(e) => { e.stopPropagation(); onSelect(keyData.code) }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {useWideBox
        ? <WideKey keyData={keyData} color={color} modelScale={modelScale} />
        : <StandardKey color={color} modelScale={modelScale} />}

      {showLabels && label && (
        <Text
          position={[0, modelScale * (useWideBox ? 0.62 : 0.68), 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(0.28, 0.45 / Math.max(label.length, 1))}
          color={textColor || '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  )
}

// ─── Escena ────────────────────────────────────────────────────────────
function KeyboardScene({ layout, keyColors, selectedKey, onSelectKey, showLabels }) {
  const { scene } = useGLTF('/blankkeycap.glb')

  const modelScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const widest = Math.max(size.x, size.z)
    return Number.isFinite(widest) && widest > 0 ? 1 / widest : 1
  }, [scene])

  const safeLayout = useMemo(() => layout.map((k) => ({
    ...k,
    x: Number.isFinite(k.x) ? k.x : 0,
    y: Number.isFinite(k.y) ? k.y : 0,
    w: Number.isFinite(k.w) && k.w > 0 ? k.w : 1,
    h: Number.isFinite(k.h) && k.h > 0 ? k.h : 1,
  })), [layout])

  const center = useMemo(() => {
    if (!safeLayout.length) return { cx: 0.5, cz: 0.5 }
    const minX = Math.min(...safeLayout.map((k) => k.x))
    const maxX = Math.max(...safeLayout.map((k) => k.x + k.w))
    const minY = Math.min(...safeLayout.map((k) => k.y))
    const maxY = Math.max(...safeLayout.map((k) => k.y + k.h))
    return { cx: (minX + maxX) / 2, cz: (minY + maxY) / 2 }
  }, [safeLayout])

  return (
    <Bounds fit clip observe margin={1.4}>
      <group position={[-center.cx, 0, -center.cz]}>
        {safeLayout.map((key) => {
          const cfg = keyColors[key.code] || {}
          return (
            <Keycap
              key={key.code}
              keyData={key}
              color={cfg.color || '#2a2a3a'}
              textColor={cfg.text_color || '#ffffff'}
              label={cfg.label ?? key.label}
              isSelected={selectedKey === key.code}
              onSelect={onSelectKey}
              showLabels={showLabels}
              modelScale={modelScale}
            />
          )
        })}
      </group>
    </Bounds>
  )
}

// ─── Controles que reaccionan a Ctrl para alternar rotar/pan ───────────
function SmartControls() {
  const controlsRef = useRef()

  useEffect(() => {
    const ctrls = controlsRef.current
    if (!ctrls) return

    const onKeyDown = (e) => {
      if (e.key === 'Control' || e.ctrlKey) {
        ctrls.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }
      }
    }
    const onKeyUp = (e) => {
      if (e.key === 'Control') {
        ctrls.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onKeyUp)
    }
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      minDistance={2.5}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.05}
      minPolarAngle={Math.PI / 8}
      enableDamping
      dampingFactor={0.08}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  )
}

function Loading() {
  return (
    <mesh>
      <boxGeometry args={[2, 0.3, 1]} />
      <meshStandardMaterial color="#2a2a3a" wireframe />
    </mesh>
  )
}

// ─── Canvas principal ──────────────────────────────────────────────────
export default function KeyboardCanvas3D(props) {
  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a1a26] to-[#0a0a0f] border border-[var(--color-border)]">
      <Canvas
        shadows
        camera={{ position: [0, 7, 8], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 14, 30]} />

        <ambientLight intensity={0.45} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 3, -3]} intensity={0.8} color="#a855f7" />
        <pointLight position={[5, 3, -3]} intensity={0.6} color="#22d3ee" />

        <Suspense fallback={<Loading />}>
          <KeyboardScene {...props} />
          <Environment preset="warehouse" />
        </Suspense>

        <SmartControls />
      </Canvas>
    </div>
  )
}
