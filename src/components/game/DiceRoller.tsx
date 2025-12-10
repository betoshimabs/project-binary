
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, useConvexPolyhedron, usePlane } from '@react-three/cannon'
import * as THREE from 'three'


import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// Helper to get precise transform for text on face
function getFaceData(normal: THREE.Vector3) {
    // 1. Position: Face center is at distance 1/sqrt(3) * radius(1)
    // We add a tiny epsilon to sit on top of the mesh (radius-ish)
    const distance = 1 / Math.sqrt(3) + 0.02
    const pos = normal.clone().multiplyScalar(distance)

    // 2. Orientation (Quaternion)
    // "Up" direction for the text. 
    // Top faces (y>0) should point their tops towards the apex (+Y)
    // Bottom faces (y<0) should point their tops towards the bottom apex (-Y)
    // Standard lookAt uses (0,1,0) as up.

    const dummy = new THREE.Object3D()
    dummy.position.copy(pos)

    // Look away from center (normal direction)
    dummy.lookAt(pos.clone().add(normal))

    // Fix roll:
    // With default up (0,1,0), top faces are generally OK.
    // Bottom faces need to be flipped? 
    // Actually, simply looking at Normal aligns Z. 
    // We need to ensure the Y axis of text points to "Top" of the face (Apex).

    const targetUp = normal.y > 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0)

    // Re-orient using quaternion specifically
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)

    // This aligns Z. Now we spin around Z to align Y with targetUp projection?
    // Let's rely on standard LookAt behavior which does exactly this (aligns up).
    dummy.up.copy(targetUp)
    dummy.lookAt(pos.clone().add(normal))

    return { pos, rot: dummy.rotation }
}

// Correct normals for D8 faces (normalized vectors (1,1,1), (1,1,-1) etc...)
const faceNormals = [
    new THREE.Vector3(1, 1, 1).normalize(),   // Face 1
    new THREE.Vector3(-1, 1, -1).normalize(), // Face 2
    new THREE.Vector3(-1, 1, 1).normalize(),  // Face 3
    new THREE.Vector3(1, 1, -1).normalize(),  // Face 4
    new THREE.Vector3(1, -1, 1).normalize(),  // Face 5 (opp 2 actually?) No, opp faces sum to 0.
    new THREE.Vector3(-1, -1, -1).normalize(), // Face 6
    new THREE.Vector3(-1, -1, 1).normalize(),  // Face 7
    new THREE.Vector3(1, -1, -1).normalize(),  // Face 8
]

// Helper to get color/glow based on value
const getFaceStyle = (val: number, active: boolean, isGolden: boolean) => {
    if (!active) return { color: isGolden ? '#554400' : (val % 2 === 0 ? '#003300' : '#330000'), outlineWidth: 0, outlineColor: '#000' }

    if (isGolden) {
        // Golden Style
        return { color: '#FFD700', outlineWidth: 0.08, outlineColor: '#FFD700' }
    }

    const isEven = val % 2 === 0
    if (isEven) {
        // Even = Green
        return { color: '#0f0', outlineWidth: 0.05, outlineColor: '#0f0' }
    } else {
        // Odd = Red
        return { color: '#f00', outlineWidth: 0.02, outlineColor: '#f00' }
    }
}

function D8({ position, onUpdate, isGolden = false }: { position: [number, number, number], onUpdate?: (val: number) => void, isGolden?: boolean }) {
    const [activeFace, setActiveFace] = useState<number | null>(null)

    // Callback when active face changes
    useEffect(() => {
        if (activeFace !== null && onUpdate) {
            onUpdate(activeFace + 1)
        }
    }, [activeFace, onUpdate])

    // We need to pass clean arrays to useConvexPolyhedron
    const args = useMemo(() => {
        // Simpler manual definition for physics:
        const v = [
            [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
        ]
        const f = [
            [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
            [1, 2, 5], [1, 5, 3], [1, 3, 4], [1, 4, 2]
        ]
        return [v, f]
    }, [])

    const [ref, api] = useConvexPolyhedron(() => {
        return {
            mass: 1,
            position,
            args: args as any,
            linearDamping: 0.5, // Drag to stop sliding
            angularDamping: 0.5, // Drag to stop spinning
            // allowSleep: true, // Disable sleep to allow 'magnetic' alignment to work until perfect
            sleepSpeedLimit: 0.1, // Sleep when slower than this
            sleepTimeLimit: 0.2, // Sleep after 0.2s of slow speed
            material: { friction: 0.1, restitution: 0.1 }, // Low restitution = less bounce
            velocity: [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, -10], // Random XY, Throw "down" (Z)
            angularVelocity: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20] // HIGH spin
        }
    })

    const upVec = new THREE.Vector3(0, 0, 1)
    const startTime = useRef(Date.now())

    useFrame(() => {
        if (!ref.current || !api) return

        const quat = new THREE.Quaternion() // Create inside useFrame to avoid state issues
        // Get current rotation
        // @ts-ignore
        ref.current.getWorldQuaternion(quat)

        // 1. Detection Logic
        let maxDot = -Infinity
        let bestFace = -1
        let bestWorldNormal = new THREE.Vector3()

        // Check which face normal is most aligned with purely UP (0,0,1)
        faceNormals.forEach((normal, index) => {
            const worldNormal = normal.clone().applyQuaternion(quat)
            const dot = worldNormal.dot(upVec)
            if (dot > maxDot) {
                maxDot = dot
                bestFace = index
                bestWorldNormal.copy(worldNormal)
            }
        })

        if (bestFace !== activeFace) {
            setActiveFace(bestFace)
        }

        // 2. Magnetic "Snap-to-Face" Physics
        // Wait for physics to play out naturally for a bit
        if (Date.now() - startTime.current < 1500) return

        const velocity = new THREE.Vector3()
        // @ts-ignore
        api.velocity.subscribe((v) => velocity.set(v[0], v[1], v[2]))()

        const angularVelocity = new THREE.Vector3()
        // @ts-ignore
        api.angularVelocity.subscribe((v) => angularVelocity.set(v[0], v[1], v[2]))()

        const speed = velocity.length()
        const rotSpeed = angularVelocity.length()

        // If die is slowing down, apply magnetic force to align best face to UP (0,0,1)
        if (speed < 1 && rotSpeed < 2) {
            // We want bestWorldNormal to align with upVec (0,0,1)
            // Torque axis is Cross Product
            const correctionAxis = new THREE.Vector3().crossVectors(bestWorldNormal, upVec)

            // Magnitude is based on how far we are (sin of angle)
            // Apply torque to correct
            // Stiffness factor
            const k = 15
            api.applyTorque([correctionAxis.x * k, correctionAxis.y * k, correctionAxis.z * k])

            // Apply extra damping when trying to snap
            api.angularDamping.set(0.9)
            api.linearDamping.set(0.9)
        } else {
            // Reset damping when moving fast
            api.angularDamping.set(0.5)
            api.linearDamping.set(0.5)
        }
    })


    return (
        <mesh ref={ref as any}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={isGolden ? "#FFD700" : (activeFace !== null && (activeFace + 1) % 2 === 0 ? "#0f0" : "#f00")} wireframe />

            {/* Inner solid for visibility */}
            <mesh scale={[0.98, 0.98, 0.98]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#000" polygonOffset polygonOffsetFactor={1} />
            </mesh>

            {/* Golden Glow Light */}
            {isGolden && <pointLight color="#FFD700" intensity={0.5} distance={3} />}

            {/* Face Numbers */}
            {faceNormals.map((normal, i) => {
                const { pos, rot } = getFaceData(normal)
                const val = i + 1
                const isActive = activeFace === i
                const style = getFaceStyle(val, isActive, isGolden)

                return (
                    <group key={i} position={pos} rotation={rot}>
                        <Text
                            fontSize={0.5} // Increased size
                            color={style.color}
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={style.outlineWidth}
                            outlineColor={style.outlineColor}
                        >
                            {val}
                        </Text>
                    </group>
                )
            })}
        </mesh>
    )
}

function Plane({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
    usePlane(() => ({ position, rotation, material: { friction: 0.1, restitution: 0.5 } }))
    return null
}

function DiceScene({ diceList, onUpdate }: { diceList: { id: number, isGolden: boolean }[], onUpdate: (id: number, val: number) => void }) {
    return (
        <Physics gravity={[0, 0, -20]}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 15]} />

            {/* Table Floor (Backplate) - Center screen */}
            <Plane position={[0, 0, -1]} rotation={[0, 0, 0]} />

            {/* Walls to keep dice in view - Box around XY plane */}
            <Plane position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]} />  {/* Left */}
            <Plane position={[4, 0, 0]} rotation={[0, -Math.PI / 2, 0]} /> {/* Right */}
            <Plane position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} /> {/* Bottom */}
            <Plane position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} />   {/* Top */}

            {diceList.map(die => (
                <D8 key={die.id} isGolden={die.isGolden} position={[(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 5 + die.id * 2]} onUpdate={(val) => onUpdate(die.id, val)} />
            ))}
        </Physics>
    )
}

export function DiceRoller({ active, count, onComplete }: { active: boolean, count: number, onComplete?: (successes: number) => void }) {
    const [visible, setVisible] = useState(false)
    const [diceList, setDiceList] = useState<{ id: number, isGolden: boolean }[]>([])
    const [showOverclock, setShowOverclock] = useState(false)
    const resultsRef = useRef<Record<number, number>>({})
    const processedDiceRef = useRef<Set<number>>(new Set()) // Track which dice have already triggered Overclock

    useEffect(() => {
        if (active) {
            setVisible(true)
            setShowOverclock(false)
            resultsRef.current = {}
            processedDiceRef.current = new Set()

            // Initial dice
            setDiceList(Array.from({ length: count }, (_, i) => ({ id: i, isGolden: false })))

            // Recursive check function
            const checkOverclock = () => {
                const currentResults = resultsRef.current
                let newDiceCount = 0

                // Check for 8s that haven't been processed
                Object.entries(currentResults).forEach(([idStr, val]) => {
                    const id = parseInt(idStr)
                    if (val === 8 && !processedDiceRef.current.has(id)) {
                        processedDiceRef.current.add(id)
                        newDiceCount++
                    }
                })

                if (newDiceCount > 0) {
                    // OVERCLOCK TRIGGERED!
                    setShowOverclock(true)
                    // Add new Golden Dice
                    setDiceList(prev => {
                        const nextId = prev.length > 0 ? Math.max(...prev.map(d => d.id)) + 1 : 0
                        const newDice = Array.from({ length: newDiceCount }, (_, i) => ({ id: nextId + i, isGolden: true }))
                        return [...prev, ...newDice]
                    })

                    // Hide alert after 1.5s
                    setTimeout(() => setShowOverclock(false), 1500)

                    // Extend wait time by 3 seconds for new dice to settle
                    setTimeout(checkOverclock, 3000)
                } else {
                    // No new 8s, we are done.
                    // Calculate final successes
                    const vals = Object.values(resultsRef.current)
                    const successes = vals.filter(v => v % 2 === 0).length

                    setTimeout(() => {
                        setVisible(false)
                        if (onComplete) onComplete(successes)
                    }, 1000)
                }
            }

            // First check after 4 seconds (initial roll time)
            const initialTimer = setTimeout(checkOverclock, 4000)

            return () => clearTimeout(initialTimer)
        }
    }, [active, count, onComplete])

    if (!active && !visible) {
        return null
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: visible ? 1 : 0,
            visibility: visible ? 'visible' : 'hidden',
            transition: 'opacity 0.5s ease-in-out'
        }}>
            {showOverclock && (
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
                    zIndex: 10000,
                    animation: 'pulse 0.2s infinite alternate'
                }}>
                    OVERCLOCK!
                </div>
            )}
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
                {visible && <DiceScene diceList={diceList} onUpdate={(id, val) => resultsRef.current[id] = val} />}
            </Canvas>
        </div>
    )
}
