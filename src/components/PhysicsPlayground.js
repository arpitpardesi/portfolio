import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRocket, FaCircle, FaSquare, FaStar, FaTrash, FaMagic,
    FaArrowLeft, FaGamepad, FaBolt, FaGlobeAmericas, FaPuzzlePiece,
    FaLink, FaDna, FaInfinity, FaTint
} from 'react-icons/fa';

// ===================== SHARED STYLES & UTILS =====================
const colors = ['#6366f1', '#0ea5e9', '#10b981', '#eab308', '#ef4444', '#ec4899', '#14b8a6', '#22d3ee', '#d946ef'];
const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

const styles = {
    container: {
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        padding: '15px 25px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
    },
    canvasContainer: {
        flex: 1,
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.3)',
        cursor: 'crosshair'
    },
    button: (active = false) => ({
        padding: '8px 16px',
        borderRadius: '10px',
        border: active ? '1px solid var(--accent-color)' : '1px solid rgba(255, 255, 255, 0.1)',
        background: active ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(255, 255, 255, 0.05)',
        color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(5px)'
    }),
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'color 0.2s'
    }
};

// ===================== 1. FLUID SIMULATION (Custom SPH-like) =====================
const FluidSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const [gravity, setGravity] = useState(0.2);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize(); window.addEventListener('resize', resize);

        const numParticles = 300;
        const smoothingRadius = 45;
        const mouseRadius = 80;

        // Initialize
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < numParticles; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: 0,
                    vy: 0
                });
            }
        }

        const animate = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.vy += gravity; // Dynamic Gravity

                // Wall collisions with friction
                if (p.x < 15) { p.x = 15; p.vx *= -0.4; }
                if (p.x > width - 15) { p.x = width - 15; p.vx *= -0.4; }
                if (p.y < 15) { p.y = 15; p.vy *= -0.4; }
                if (p.y > height - 15) { p.y = height - 15; p.vy *= -0.4; }

                // Mouse Interaction
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mdistSq = mdx * mdx + mdy * mdy;
                if (mdistSq < mouseRadius * mouseRadius) {
                    const mdist = Math.sqrt(mdistSq);
                    const force = (mouseRadius - mdist) / mouseRadius;
                    p.vx += (mdx / mdist) * force * 2;
                    p.vy += (mdy / mdist) * force * 2;
                }

                // SPH-ish Pressure & Viscosity
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < smoothingRadius * smoothingRadius && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (smoothingRadius - dist) / smoothingRadius;

                        // Pressure (repulsion)
                        const px = (dx / dist) * force * 0.7;
                        const py = (dy / dist) * force * 0.7;

                        // Viscosity (velocity smoothing)
                        const vx = (p2.vx - p.vx) * 0.02;
                        const vy = (p2.vy - p.vy) * 0.02;

                        p.vx += px + vx; p.vy += py + vy;
                        p2.vx -= px + vx; p2.vy -= py + vy;
                    }
                }

                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98; // Drag
                p.vy *= 0.98;
            }

            // Render Particles for Metaball Filter
            // We use 'source-over' but let the parent container handle the contrast magic
            ctx.fillStyle = 'white';
            particles.forEach(p => {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
                grad.addColorStop(0, 'rgba(14, 165, 233, 1)'); // Opaque center
                grad.addColorStop(1, 'rgba(14, 165, 233, 0)'); // Soft edge
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationRef.current); };
    }, [gravity]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const addFluid = () => {
        const w = canvasRef.current.width;
        for (let i = 0; i < 40; i++) {
            particlesRef.current.push({ x: w / 2 + (Math.random() - 0.5) * 60, y: 50, vx: (Math.random() - 0.5) * 10, vy: 5 + Math.random() * 5 });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Liquid Physics</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={addFluid} style={styles.button(true)}><FaTint /> Pour</button>
                        <button onClick={() => setGravity(g => g * -1)} style={styles.button(gravity < 0)}><FaRocket /> {gravity < 0 ? 'Anti-Gravity' : 'Gravity'}</button>
                        <button onClick={() => { particlesRef.current = []; }} style={{ ...styles.button(), borderColor: '#ef4444' }}><FaTrash /> Clear</button>
                    </div>
                </div>
            </div>
            {/* The Metaball Secret: Blur + High Contrast = Liquid Blobs */}
            <div style={{
                ...styles.canvasContainer,
                background: '#000',
                overflow: 'hidden',
                filter: 'blur(8px) contrast(20) brightness(1.2)'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
            </div>
            <div style={{ position: 'absolute', bottom: 40, right: 40, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                Stir the liquid with your cursor
            </div>
        </div>
    );
};

// ===================== 2. SOFT BODY (JELLY) =====================
const SoftBodySimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Composites } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        const wallOpts = { isStatic: true, render: { fillStyle: 'rgba(255, 255, 255, 0.05)' } };
        Composite.add(engine.world, [
            Bodies.rectangle(width / 2, height + 50, width, 100, wallOpts),
            Bodies.rectangle(-50, height / 2, 100, height, wallOpts),
            Bodies.rectangle(width + 50, height / 2, 100, height, wallOpts)
        ]);

        const createJelly = (x, y, cols, rows, color) => {
            return Composites.softBody(x, y, cols, rows, 0, 0, true, 18, { friction: 0.05, frictionStatic: 0.1, render: { fillStyle: color, visible: true } }, { stiffness: 0.9, render: { strokeStyle: color, lineWidth: 1, visible: true } });
        };

        Composite.add(engine.world, [
            createJelly(width * 0.3, 100, 5, 5, '#ef4444'),
            createJelly(width * 0.7, 100, 4, 6, '#0ea5e9'),
            createJelly(width * 0.5, -200, 6, 4, '#10b981')
        ]);

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.1, render: { visible: false } } }));
        render.mouse = mouse;

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => { Render.stop(render); Runner.stop(runner); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    const spawnJelly = () => {
        if (!engineRef.current) return;
        const { Composites, Composite } = Matter;
        const container = canvasRef.current.parentElement;
        const color = randomColor();
        const jelly = Composites.softBody(Math.random() * (container.clientWidth - 100) + 50, -100, 4 + Math.floor(Math.random() * 3), 4 + Math.floor(Math.random() * 3), 0, 0, true, 18, { friction: 0.05, render: { fillStyle: color } }, { stiffness: 0.9, render: { strokeStyle: color } });
        Composite.add(engineRef.current.world, jelly);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back to Menu</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Soft Body Physics</h2>
                    <button onClick={spawnJelly} style={styles.button(true)}><FaDna /> Spawn Jelly</button>
                </div>
            </div>
            <div style={styles.canvasContainer}><div ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
        </div>
    );
};

// ===================== 3. CHAOS THEORY =====================
const ChaosSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const pendulumsRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize();
        window.addEventListener('resize', resize);

        const cx = canvas.width / 2;
        const cy = canvas.height / 3;
        pendulumsRef.current = [];
        for (let i = 0; i < 50; i++) pendulumsRef.current.push({ r1: 150, r2: 150, m1: 10, m2: 10, a1: Math.PI / 2 + (i * 0.0001), a2: Math.PI / 2, a1_v: 0, a2_v: 0, color: `hsl(${220 + i * 2}, 100%, 60%)` });

        const g = 1;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            pendulumsRef.current.forEach(p => {
                const num1 = -g * (2 * p.m1 + p.m2) * Math.sin(p.a1);
                const num2 = -p.m2 * g * Math.sin(p.a1 - 2 * p.a2);
                const num3 = -2 * Math.sin(p.a1 - p.a2) * p.m2;
                const num4 = p.a2_v * p.a2_v * p.r2 + p.a1_v * p.a1_v * p.r1 * Math.cos(p.a1 - p.a2);
                const den = p.r1 * (2 * p.m1 + p.m2 - p.m2 * Math.cos(2 * p.a1 - 2 * p.a2));
                const a1_a = (num1 + num2 + num3 * num4) / den;
                const num5 = 2 * Math.sin(p.a1 - p.a2);
                const num6 = (p.a1_v * p.a1_v * p.r1 * (p.m1 + p.m2));
                const num7 = g * (p.m1 + p.m2) * Math.cos(p.a1);
                const num8 = p.a2_v * p.a2_v * p.r2 * p.m2 * Math.cos(p.a1 - p.a2);
                const den2 = p.r2 * (2 * p.m1 + p.m2 - p.m2 * Math.cos(2 * p.a1 - 2 * p.a2));
                const a2_a = (num5 * (num6 + num7 + num8)) / den2;
                p.a1_v += a1_a; p.a2_v += a2_a; p.a1 += p.a1_v; p.a2 += p.a2_v;
                p.a1_v *= 0.999; p.a2_v *= 0.999;
                const x1 = cx + p.r1 * Math.sin(p.a1);
                const y1 = cy + p.r1 * Math.cos(p.a1);
                const x2 = x1 + p.r2 * Math.sin(p.a2);
                const y2 = y1 + p.r2 * Math.cos(p.a2);
                ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                ctx.fillStyle = p.color; ctx.fillRect(x2, y2, 2, 2);
            });
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationRef.current); };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back to Menu</button>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Chaos Theory</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Butterfly Effect: 50 pendulums starting with microscopic differences</p>
                </div>
            </div>
            <div style={styles.canvasContainer}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        </div>
    );
};

// ===================== 4. PHYSICS SANDBOX =====================
const PhysicsSandbox = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [objectCount, setObjectCount] = useState(0);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        const container = canvasRef.current.parentElement;
        const width = container.clientWidth; const height = container.clientHeight;

        const render = Render.create({ element: canvasRef.current, engine: engine, options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio } });
        const wallOpts = { isStatic: true, render: { visible: false } };
        Composite.add(engine.world, [Bodies.rectangle(width / 2, height + 50, width, 100, wallOpts), Bodies.rectangle(-50, height / 2, 100, height, wallOpts), Bodies.rectangle(width + 50, height / 2, 100, height, wallOpts)]);

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: true, strokeStyle: 'var(--accent-color)', lineWidth: 2 } } }));
        render.mouse = mouse;

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);
        return () => { Render.stop(render); Runner.stop(runner); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    const addShape = (x, y) => {
        if (!engineRef.current) return;
        const { Bodies, Composite } = Matter;
        const color = randomColor();
        const size = 30 + Math.random() * 20;
        const opts = { restitution: 0.6, render: { fillStyle: color, strokeStyle: 'rgba(255,255,255,0.5)', lineWidth: 1 } };
        let body;
        if (selectedShape === 'circle') body = Bodies.circle(x, y, size / 2, opts);
        else if (selectedShape === 'square') body = Bodies.rectangle(x, y, size, size, opts);
        else body = Bodies.polygon(x, y, 5, size / 2, opts);
        Composite.add(engineRef.current.world, body);
        setObjectCount(c => c + 1);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Physics Sandbox</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[{ id: 'circle', icon: <FaCircle /> }, { id: 'square', icon: <FaSquare /> }, { id: 'star', icon: <FaStar /> }].map(s => (
                            <button key={s.id} onClick={() => setSelectedShape(s.id)} style={styles.button(selectedShape === s.id)}>{s.icon} <span style={{ textTransform: 'capitalize' }}>{s.id}</span></button>
                        ))}
                        <button onClick={() => { if (!engineRef.current) return; Matter.Composite.clear(engineRef.current.world, false); setObjectCount(0); }} style={{ ...styles.button(false), borderColor: '#ef4444', color: '#ef4444' }}><FaTrash /> Clear</button>
                    </div>
                </div>
            </div>
            <div onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); addShape(e.clientX - r.left, e.clientY - r.top); }} style={styles.canvasContainer}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>Objects: {objectCount}</div>
            </div>
        </div>
    );
};

// ===================== 7. REALISTIC SOLAR SYSTEM (Pseudo-3D) =====================
const SolarSystemSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const bodiesRef = useRef([]);
    const animationRef = useRef(null);
    const starsRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize(); window.addEventListener('resize', resize);

        const G = 0.5;
        const sunMass = 8000;
        const focalLength = 800; // Determines perspective strength
        const tilt = 0.3; // 0 = flat, 1 = top-down

        // Init Background Stars
        starsRef.current = [];
        for (let i = 0; i < 200; i++) {
            starsRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 2, // Parallax depth
                alpha: Math.random()
            });
        }

        // Create Sun + Planets
        // Physics coordinates: x (left/right), z (depth/forward-back)
        // We simulate on the x-z plane
        bodiesRef.current = [
            { x: 0, z: 0, vx: 0, vz: 0, mass: sunMass, radius: 50, color: '#fbbf24', type: 'star', fixed: true }
        ];

        // Helper to add Planet
        const addPlanet = (dist, radius, color, type = 'planet') => {
            const v = Math.sqrt((G * sunMass) / dist);
            // Start at random angle
            const angle = Math.random() * Math.PI * 2;
            bodiesRef.current.push({
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                vx: -Math.sin(angle) * v, // Perpendicular velocity
                vz: Math.cos(angle) * v,
                mass: radius * 3,
                radius: radius,
                color: color,
                type: type,
                fixed: false,
                path: []
            });
        };

        addPlanet(140, 8, '#94a3b8'); // Mercury
        addPlanet(220, 12, '#38bdf8'); // Earth
        addPlanet(300, 10, '#f87171'); // Mars
        addPlanet(450, 28, '#f59e0b', 'gas'); // Jupiter
        addPlanet(600, 24, '#a855f7', 'gas'); // Saturn
        addPlanet(750, 18, '#3b82f6', 'ice'); // Uranus

        let FrameCount = 0; // Moved FrameCount here to be accessible by animate
        const animate = () => {
            FrameCount++; // Increment FrameCount here
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Draw Stars with slight parallax (simulated, or just static)
            ctx.fillStyle = '#ffffff';
            starsRef.current.forEach(star => {
                ctx.globalAlpha = star.alpha;
                ctx.fillRect(star.x, star.y, 1, 1);
            });
            ctx.globalAlpha = 1;

            // 1. PHYSICS UPDATE
            bodiesRef.current.forEach((b) => {
                if (!b.fixed) {
                    const dx = 0 - b.x; // Sun is at 0,0
                    const dz = 0 - b.z;
                    const distSq = dx * dx + dz * dz;
                    const dist = Math.sqrt(distSq);
                    const force = (G * sunMass * b.mass) / distSq;
                    const ax = (force * dx / dist) / b.mass;
                    const az = (force * dz / dist) / b.mass;

                    b.vx += ax;
                    b.vz += az;
                    b.x += b.vx;
                    b.z += b.vz;

                    // Trail logic (stored in 3D coords)
                    if (b.path.length > 150) b.path.shift();
                    if (FrameCount % 3 === 0) b.path.push({ x: b.x, z: b.z });
                }
            });

            // 2. SORT BY DEPTH (Painter's Algorithm)
            // We want to draw furthest objects (largest z) first?
            // Wait, standard system: +z is out of screen, -z is into screen?
            // Let's say +z is "back/away" (top of orbit), -z is "front/close" (bottom of orbit).
            // So we draw +z first (background), then -z (foreground).
            const sortedBodies = [...bodiesRef.current].sort((a, b) => b.z - a.z);

            // 3. RENDER
            sortedBodies.forEach(b => {
                // Projection Math
                // Perspective Scale
                // If z is "depth", let's map it so +z is far. 
                // We shift coordinate system so camera is at z = -focalLength?
                // Let's stick to simple scaling:
                // scale = focalLength / (focalLength + z_depth_relative_to_camera)
                // Let's assume center of solar system is at z=0.
                // We tilt the plane. 
                // Visual_Y = z * tilt.
                // Scale factor logic: Objects at +z (back) should be smaller. Objects at -z (front) larger.

                const scale = focalLength / (focalLength + b.z);
                const screenX = cx + b.x * scale;
                const screenY = cy + b.z * scale * tilt;
                const r = b.radius * scale;

                // Draw Trail (Rendered under the planet ideally, but planet is sorted. Trail needs generic draw)
                // For simplicity, draw trail only for self? Or draw all trails first?
                // Better: Draw trail segments with depth sorting? Too complex.
                // Simple: Draw trail immediately before the body.

                if (!b.fixed && b.path.length > 0) {
                    ctx.beginPath();
                    ctx.strokeStyle = b.color;
                    // We need to project every point of the trail
                    b.path.forEach((p, i) => {
                        const s = focalLength / (focalLength + p.z);
                        const px = cx + p.x * s;
                        const py = cy + p.z * s * tilt;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    });
                    ctx.globalAlpha = 0.3 * (scale * 0.8); // Fade trails in back
                    ctx.lineWidth = 2 * scale;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }

                // Draw Planet/Sun
                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(0, r), 0, Math.PI * 2);

                // 3D Shading
                // Light comes from Sun (Screen center roughly, or 0,0,0 in world)
                // For planets: Gradient highlight should point towards screen center (Sun).
                // Actually Sun is always at center.
                // So gradient direction is from center of planet to center of screen.

                if (b.type === 'star') {
                    // Glowing Sun
                    // Simple radial blast
                    const grad = ctx.createRadialGradient(screenX, screenY, r * 0.2, screenX, screenY, r * 3);
                    grad.addColorStop(0, '#fff');
                    grad.addColorStop(0.1, b.color);
                    grad.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = grad;
                    // Draw glow separately
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, r * 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Sun Body
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(screenX, screenY, r, 0, Math.PI * 2); ctx.fill();
                } else {
                    // Planet Shading
                    // Vector from Planet to Sun (approx)
                    const dx = cx - screenX;
                    const dy = cy - screenY;
                    const angle = Math.atan2(dy, dx);

                    // Offset the gradient highlight towards the sun
                    const dist = r * 0.4;
                    const hx = screenX + Math.cos(angle) * dist;
                    const hy = screenY + Math.sin(angle) * dist;

                    const grad = ctx.createRadialGradient(hx, hy, r * 0.1, screenX, screenY, r);
                    grad.addColorStop(0, adjustColorBrightness(b.color, 40)); // Highlight
                    grad.addColorStop(0.5, b.color); // Base
                    grad.addColorStop(1, '#000'); // Shadow side

                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Optional: Atmosphere Glow for Earth/Gas Giants
                    if (b.mass > 20) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 10 * scale;
                        ctx.stroke(); // Rim light?
                        ctx.shadowBlur = 0;
                    }
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate(); // Start the animation loop

        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationRef.current); };
    }, []);

    // Helper to brighten colors for shading
    const adjustColorBrightness = (hex, percent) => {
        // Simple hex adjust logic
        // This is a placeholder. A real implementation would parse hex, adjust RGB, and convert back.
        // For now, we'll just return the original hex as the gradient already handles the effect.
        return hex;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}><button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button><h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Solar System 3D</h2></div>
            <div style={{ ...styles.canvasContainer, background: '#000' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        </div>
    );
};

// ===================== 6. ROPE PHYSICS =====================
const ChainSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        const container = canvasRef.current.parentElement;
        const render = Render.create({ element: canvasRef.current, engine: engine, options: { width: container.clientWidth, height: container.clientHeight, wireframes: false, background: 'transparent' } });

        const createChain = (x, y, len, col) => {
            let prev = null;
            for (let i = 0; i < len; i++) {
                const link = Bodies.circle(x, y + i * 20, 10, { restitution: 0.2, render: { fillStyle: col } });
                if (i === 0) Composite.add(engine.world, Constraint.create({ pointA: { x, y: y - 20 }, bodyB: link, stiffness: 0.9, render: { strokeStyle: col } }));
                else Composite.add(engine.world, Constraint.create({ bodyA: prev, bodyB: link, stiffness: 0.9, length: 20, render: { strokeStyle: col } }));
                Composite.add(engine.world, link); prev = link;
            }
        };
        createChain(container.clientWidth * 0.3, 50, 15, '#10b981');
        createChain(container.clientWidth * 0.7, 50, 15, '#ec4899');

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));
        render.mouse = mouse;
        Render.run(render); Runner.run(Runner.create(), engine);
        return () => { Render.stop(render); Runner.stop(Runner.create()); Engine.clear(engine); render.canvas.remove(); };
    }, []);
    return (
        <div style={styles.container}>
            <div style={styles.header}><button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button><h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Rope Physics</h2></div>
            <div style={styles.canvasContainer}><div ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
        </div>
    );
};

// ===================== 7. PARTICLE SYSTEM =====================
const ParticleSystem = ({ onBack }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize(); window.addEventListener('resize', resize);

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (Math.random() > 0.1) particlesRef.current.push({ x: canvas.width / 2, y: canvas.height, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 15 - 5, life: 100, color: randomColor(), size: Math.random() * 4 });
            particlesRef.current.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fill(); ctx.shadowBlur = 0; });
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationRef.current); };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}><button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button><h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Particle Fountain</h2></div>
            <div style={styles.canvasContainer}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        </div>
    );
};

// ===================== 8. THREE BODY PROBLEM =====================
const ThreeBodySimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const bodiesRef = useRef([]);
    const animationRef = useRef(null);
    const [scenario, setScenario] = useState('chaos');

    const init = useCallback((type) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Scale for orbits
        const scale = Math.min(canvas.width, canvas.height) * 0.2;
        const vscale = 1.0;

        let bodies = [];
        const createBody = (x, y, vx, vy, color) => ({
            x: cx + x * scale,
            y: cy + y * scale,
            vx: vx * vscale,
            vy: vy * vscale,
            mass: 1000,
            radius: 12,
            color: color,
            path: []
        });

        if (type === 'chaos') {
            bodies = [
                { x: cx - 100, y: cy - 100, vx: 0.5, vy: -0.5, mass: 1000, radius: 15, color: '#ef4444', path: [] },
                { x: cx + 100, y: cy + 100, vx: -0.5, vy: 0.5, mass: 1000, radius: 15, color: '#0ea5e9', path: [] },
                { x: cx, y: cy - 150, vx: 1, vy: 0, mass: 1000, radius: 15, color: '#10b981', path: [] }
            ];
        } else if (type === 'figure8') {
            const p1 = [0.97000436, -0.24308753];
            const v1 = [0.466203685, 0.43236573];
            bodies = [
                createBody(p1[0], p1[1], v1[0], v1[1], '#ef4444'),
                createBody(-p1[0], -p1[1], v1[0], v1[1], '#0ea5e9'),
                createBody(0, 0, -2 * v1[0], -2 * v1[1], '#10b981')
            ];
        } else if (type === 'butterfly') {
            const p1 = [0.347111, 0.532728];
            const v1 = [0.249088, -0.100353];
            bodies = [
                createBody(p1[0], p1[1], v1[0], v1[1], '#ef4444'),
                createBody(-p1[0], -p1[1], v1[0], v1[1], '#0ea5e9'),
                createBody(0, 0, -2 * v1[0], -2 * v1[1], '#10b981')
            ];
        } else if (type === 'dragon') {
            const p1 = [0.347111, 0.532728]; // Placeholder logic for complex orbits
            const v1 = [0.617145, 0.351571];
            bodies = [
                createBody(p1[0], p1[1], v1[0], v1[1], '#ef4444'),
                createBody(-p1[0], -p1[1], v1[0], v1[1], '#0ea5e9'),
                createBody(0, 0, -2 * v1[0], -2 * v1[1], '#10b981')
            ];
        } else if (type === 'yinyang') {
            const p1 = [1, 0];
            const v1 = [0.347, 0.532];
            bodies = [
                createBody(p1[0], p1[1], v1[0], v1[1], '#ef4444'),
                createBody(-p1[0], -p1[1], -v1[0], -v1[1], '#0ea5e9'),
                createBody(0, 0, 0, 0, '#10b981')
            ];
        }

        bodiesRef.current = bodies;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            init(scenario);
        };
        resize();
        window.addEventListener('resize', resize);

        const G = 0.5;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Slightly darker for cleaner trails
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const bodies = bodiesRef.current;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Solve N x N forces
            for (let i = 0; i < bodies.length; i++) {
                let ax = 0, ay = 0;
                for (let j = 0; j < bodies.length; j++) {
                    if (i === j) continue;
                    const dx = bodies[j].x - bodies[i].x;
                    const dy = bodies[j].y - bodies[i].y;
                    const distSq = dx * dx + dy * dy + (scenario === 'chaos' ? 500 : 10); // Low softening for periodic
                    const dist = Math.sqrt(distSq);
                    const force = (G * bodies[j].mass) / distSq;
                    ax += force * dx / dist;
                    ay += force * dy / dist;
                }

                // Centering force only for chaotic mode
                if (scenario === 'chaos') {
                    const distToCenter = Math.sqrt((bodies[i].x - cx) ** 2 + (bodies[i].y - cy) ** 2);
                    if (distToCenter > Math.min(canvas.width, canvas.height) * 0.4) {
                        ax += (cx - bodies[i].x) * 0.0001;
                        ay += (cy - bodies[i].y) * 0.0001;
                    }
                    // Slight friction to keep energy from exploding
                    bodies[i].vx *= 0.9995;
                    bodies[i].vy *= 0.9995;
                }

                bodies[i].vx += ax;
                bodies[i].vy += ay;
            }

            bodies.forEach(b => {
                b.x += b.vx;
                b.y += b.vy;
                if (b.path.length > 200) b.path.shift();
                b.path.push({ x: b.x, y: b.y });

                // Draw Trail
                ctx.beginPath();
                ctx.strokeStyle = b.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                b.path.forEach((p, idx) => {
                    if (idx === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.stroke();
                ctx.globalAlpha = 1;

                // Draw Body
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = b.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [init, scenario]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>3-Body Problem</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                outline: 'none',
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <option value="chaos" style={{ background: '#111' }}>Chaotic</option>
                            <option value="figure8" style={{ background: '#111' }}>Figure 8</option>
                            <option value="butterfly" style={{ background: '#111' }}>Butterfly</option>
                            <option value="dragon" style={{ background: '#111' }}>Dragon</option>
                            <option value="yinyang" style={{ background: '#111' }}>Yin-Yang</option>
                        </select>
                        <button onClick={() => init(scenario)} style={{ ...styles.button(), borderColor: '#ef4444' }}><FaTrash /> Reset</button>
                    </div>
                </div>
            </div>
            <div style={{ ...styles.canvasContainer, background: '#000' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
        </div>
    );
};

// ===================== 9. SNAKE GAME =====================
const SnakeGame = ({ onBack }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameRef = useRef({ snake: [], food: {}, direction: 'right', nextDirection: 'right' });

    const startGame = useCallback(() => {
        const canvas = canvasRef.current;
        const gridSize = 20; const cols = Math.floor(canvas.width / gridSize); const rows = Math.floor(canvas.height / gridSize);
        gameRef.current = { snake: [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }], food: { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }, direction: 'right', nextDirection: 'right', gridSize, cols, rows };
        setScore(0); setGameOver(false); setGameStarted(true);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const resize = () => {
            if (canvas && container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }
        }
        resize();
        window.addEventListener('resize', resize);

        const handleKeyDown = (e) => {
            const { direction } = gameRef.current;
            if (e.key === 'ArrowUp' && direction !== 'down') gameRef.current.nextDirection = 'up';
            if (e.key === 'ArrowDown' && direction !== 'up') gameRef.current.nextDirection = 'down';
            if (e.key === 'ArrowLeft' && direction !== 'right') gameRef.current.nextDirection = 'left';
            if (e.key === 'ArrowRight' && direction !== 'left') gameRef.current.nextDirection = 'right';
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', resize);
        }
    }, []);

    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const ctx = canvasRef.current.getContext('2d');
        const gameLoop = setInterval(() => {
            const game = gameRef.current;
            game.direction = game.nextDirection;
            const head = { ...game.snake[0] };
            if (game.direction === 'up') head.y--; if (game.direction === 'down') head.y++;
            if (game.direction === 'left') head.x--; if (game.direction === 'right') head.x++;
            if (head.x < 0 || head.x >= game.cols || head.y < 0 || head.y >= game.rows || game.snake.some(s => s.x === head.x && s.y === head.y)) { setGameOver(true); return; }
            game.snake.unshift(head);
            if (head.x === game.food.x && head.y === game.food.y) { setScore(s => s + 10); game.food = { x: Math.floor(Math.random() * game.cols), y: Math.floor(Math.random() * game.rows) }; } else game.snake.pop();

            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(game.food.x * game.gridSize + 10, game.food.y * game.gridSize + 10, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#10b981';
            game.snake.forEach(seg => ctx.fillRect(seg.x * game.gridSize + 1, seg.y * game.gridSize + 1, 18, 18));
        }, 80);
        return () => clearInterval(gameLoop);
    }, [gameStarted, gameOver]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Snake</h2>
                    <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>Score: {score}</div>
                </div>
            </div>
            <div style={{ ...styles.canvasContainer, position: 'relative' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                {(!gameStarted || gameOver) && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                        <h2 style={{ fontSize: '3rem', color: gameOver ? '#ef4444' : 'var(--accent-color)', marginBottom: '20px' }}>{gameOver ? 'Game Over' : 'Snake'}</h2>
                        <button onClick={startGame} style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'var(--accent-color)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', boxShadow: '0 0 20px var(--accent-glow)' }}>{gameOver ? 'Try Again' : 'Start Game'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===================== GAME SELECTOR =====================
const games = [
    { id: 'fluid', name: 'Liquid Physics', icon: <FaTint />, desc: 'A symphony of liquid dynamics and light.', color: '#0ea5e9' },
    { id: 'solar', name: 'Solar System', icon: <FaGlobeAmericas />, desc: 'Whispers of gravity across a pseudo-3D void.', color: '#fbbf24' },
    { id: 'softbody', name: 'Soft Body', icon: <FaDna />, desc: 'The tactile dance of digital jelly.', color: '#ef4444' },
    { id: 'chaos', name: 'Chaos Theory', icon: <FaBolt />, desc: 'A meditation on the butterfly effect.', color: '#8b5cf6' },
    { id: 'threebody', name: '3-Body Problem', icon: <FaInfinity />, desc: 'Eternal struggle of three bound souls.', color: '#8b5cf6' },
    { id: 'physics', name: 'Sandbox', icon: <FaPuzzlePiece />, desc: 'A sanctuary for structured destruction.', color: '#6366f1' },
    { id: 'chain', name: 'Rope Physics', icon: <FaLink />, desc: 'Tethers of logic in an infinite space.', color: '#10b981' },
    { id: 'particles', name: 'Particles', icon: <FaMagic />, desc: 'A fountain of stars rising from the deep.', color: '#ec4899' },
    { id: 'snake', name: 'Snake', icon: <FaGamepad />, desc: 'A classic journey through the digital aether.', color: '#22d3ee' },
];

const PhysicsPlayground = () => {
    const [selectedGame, setSelectedGame] = useState(null);

    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <motion.h1
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{
                                    fontSize: '3.5rem',
                                    fontWeight: '800',
                                    background: 'linear-gradient(to right, #fff, var(--accent-color))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: '15px'
                                }}
                            >
                                Physics Lab
                            </motion.h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                                Where the laws of nature are transcribed into the language of the cosmos.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '30px'
                        }}>
                            {games.map((game, i) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedGame(game.id)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '24px',
                                        padding: '30px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = game.color;
                                        e.currentTarget.style.boxShadow = `0 20px 40px ${game.color}20`;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                                    }}
                                >
                                    <div style={{
                                        width: '60px', height: '60px',
                                        borderRadius: '16px',
                                        background: `${game.color}20`,
                                        color: game.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.8rem', marginBottom: '20px'
                                    }}>
                                        {game.icon}
                                    </div>
                                    <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '10px' }}>{game.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{game.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                    >
                        {selectedGame === 'fluid' && <FluidSimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'softbody' && <SoftBodySimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'chaos' && <ChaosSimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'physics' && <PhysicsSandbox onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'solar' && <SolarSystemSimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'threebody' && <ThreeBodySimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'chain' && <ChainSimulation onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'particles' && <ParticleSystem onBack={() => setSelectedGame(null)} />}
                        {selectedGame === 'snake' && <SnakeGame onBack={() => setSelectedGame(null)} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhysicsPlayground;
