import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRocket, FaCircle, FaSquare, FaStar, FaTrash, FaMagic,
    FaArrowLeft, FaGamepad, FaBolt, FaGlobeAmericas, FaPuzzlePiece,
    FaLink, FaBomb, FaWind
} from 'react-icons/fa';

// Shared styles for full-screen games
const gameContainerStyle = { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '10px' };
const controlBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px', minHeight: '40px' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' };
const canvasContainerStyle = { flex: 1, borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.4)', overflow: 'hidden', cursor: 'crosshair' };
const btnStyle = (active) => ({ padding: '6px 12px', borderRadius: '6px', border: active ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', background: active ? 'rgba(var(--accent-rgb), 0.2)' : 'rgba(0,0,0,0.3)', color: active ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' });

// ===================== PHYSICS SANDBOX =====================
const PhysicsSandbox = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [objectCount, setObjectCount] = useState(0);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 1;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        const wallOpts = { isStatic: true, render: { fillStyle: 'rgba(99, 102, 241, 0.3)', strokeStyle: 'var(--accent-color)', lineWidth: 2 } };
        Composite.add(engine.world, [
            Bodies.rectangle(width / 2, height + 25, width + 100, 50, wallOpts),
            Bodies.rectangle(-25, height / 2, 50, height + 100, wallOpts),
            Bodies.rectangle(width + 25, height / 2, 50, height + 100, wallOpts),
            Bodies.rectangle(width / 2, -25, width + 100, 50, wallOpts)
        ]);

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: true, strokeStyle: 'var(--accent-color)', lineWidth: 2 } } }));
        render.mouse = mouse;

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        const handleResize = () => {
            const w = container.clientWidth, h = container.clientHeight;
            render.canvas.width = w; render.canvas.height = h;
            render.options.width = w; render.options.height = h;
        };
        window.addEventListener('resize', handleResize);

        return () => { window.removeEventListener('resize', handleResize); Render.stop(render); Runner.stop(runner); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#eab308', '#ef4444', '#ec4899', '#14b8a6', '#22d3ee', '#d946ef'];
    const addShape = (x, y) => {
        if (!engineRef.current) return;
        const { Bodies, Composite } = Matter;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 25 + Math.random() * 35;
        const opts = { restitution: 0.7, friction: 0.1, render: { fillStyle: color, strokeStyle: 'rgba(255,255,255,0.3)', lineWidth: 2 } };
        let body;
        switch (selectedShape) {
            case 'circle': body = Bodies.circle(x, y, size / 2, opts); break;
            case 'square': body = Bodies.rectangle(x, y, size, size, opts); break;
            case 'star': body = Bodies.polygon(x, y, 5, size / 2, opts); break;
            default:
                const shapes = ['circle', 'rectangle', 'polygon'];
                const s = shapes[Math.floor(Math.random() * 3)];
                body = s === 'circle' ? Bodies.circle(x, y, size / 2, opts) : s === 'rectangle' ? Bodies.rectangle(x, y, size, size * 0.6, opts) : Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 5), size / 2, opts);
        }
        Composite.add(engineRef.current.world, body);
        setObjectCount(c => c + 1);
    };

    const spawnMany = () => {
        const c = canvasRef.current?.parentElement;
        if (!c) return;
        for (let i = 0; i < 25; i++) setTimeout(() => addShape(50 + Math.random() * (c.clientWidth - 100), 30 + Math.random() * 80), i * 40);
    };

    const clearAll = () => {
        if (!engineRef.current) return;
        Matter.Composite.allBodies(engineRef.current.world).forEach(b => { if (!b.isStatic) Matter.Composite.remove(engineRef.current.world, b); });
        setObjectCount(0);
    };

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[{ id: 'circle', icon: <FaCircle /> }, { id: 'square', icon: <FaSquare /> }, { id: 'star', icon: <FaStar /> }, { id: 'random', icon: <FaPuzzlePiece /> }].map(s => (
                        <button key={s.id} onClick={() => setSelectedShape(s.id)} style={btnStyle(selectedShape === s.id)}>{s.icon}</button>
                    ))}
                    <button onClick={spawnMany} style={{ ...btnStyle(false), borderColor: '#10b981', color: '#10b981' }}><FaMagic /> +25</button>
                    <button onClick={clearAll} style={{ ...btnStyle(false), borderColor: '#ef4444', color: '#ef4444' }}><FaTrash /></button>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Objects: <b style={{ color: 'var(--accent-color)' }}>{objectCount}</b></span>
            </div>
            <div onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); addShape(e.clientX - r.left, e.clientY - r.top); }} style={canvasContainerStyle}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

// ===================== PENDULUM SIMULATION =====================
const PendulumSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Constraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 1.5;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        // Create Newton's Cradle
        const cradleX = width / 2;
        const cradleY = 80;
        const ballRadius = 25;
        const ropeLength = height * 0.4;
        const spacing = ballRadius * 2.05;
        const numBalls = 5;

        for (let i = 0; i < numBalls; i++) {
            const x = cradleX + (i - (numBalls - 1) / 2) * spacing;
            const ball = Bodies.circle(x, cradleY + ropeLength, ballRadius, {
                restitution: 1,
                friction: 0,
                frictionAir: 0.0001,
                render: { fillStyle: '#6366f1', strokeStyle: 'white', lineWidth: 2 }
            });
            const constraint = Constraint.create({
                pointA: { x: x, y: cradleY },
                bodyB: ball,
                stiffness: 1,
                length: ropeLength,
                render: { strokeStyle: 'rgba(255,255,255,0.5)', lineWidth: 2 }
            });
            Composite.add(engine.world, [ball, constraint]);
        }

        // Pull first ball
        const bodies = Composite.allBodies(engine.world);
        if (bodies.length > 0) {
            Matter.Body.setPosition(bodies[0], { x: bodies[0].position.x - 100, y: bodies[0].position.y - 50 });
        }

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => { Render.stop(render); Runner.stop(runner); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    const reset = () => {
        const container = canvasRef.current?.parentElement;
        if (!container || !engineRef.current) return;
        Matter.Composite.clear(engineRef.current.world);

        const width = container.clientWidth;
        const height = container.clientHeight;
        const cradleX = width / 2;
        const cradleY = 80;
        const ballRadius = 25;
        const ropeLength = height * 0.4;
        const spacing = ballRadius * 2.05;

        for (let i = 0; i < 5; i++) {
            const x = cradleX + (i - 2) * spacing;
            const ball = Matter.Bodies.circle(x, cradleY + ropeLength, ballRadius, {
                restitution: 1, friction: 0, frictionAir: 0.0001,
                render: { fillStyle: '#6366f1', strokeStyle: 'white', lineWidth: 2 }
            });
            const constraint = Matter.Constraint.create({
                pointA: { x, y: cradleY }, bodyB: ball, stiffness: 1, length: ropeLength,
                render: { strokeStyle: 'rgba(255,255,255,0.5)', lineWidth: 2 }
            });
            Matter.Composite.add(engineRef.current.world, [ball, constraint]);
        }
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        if (bodies.length > 0) Matter.Body.setPosition(bodies[0], { x: bodies[0].position.x - 100, y: bodies[0].position.y - 50 });
    };

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Newton's Cradle</span>
                <button onClick={reset} style={btnStyle(false)}>Reset</button>
            </div>
            <div style={canvasContainerStyle}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

// ===================== CHAIN/ROPE SIMULATION =====================
const ChainSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engine.world.gravity.y = 1;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        // Create multiple chains
        const createChain = (startX, startY, length, linkSize, color) => {
            let prev = null;
            for (let i = 0; i < length; i++) {
                const link = Bodies.circle(startX, startY + i * linkSize * 1.5, linkSize / 2, {
                    restitution: 0.2,
                    render: { fillStyle: color, strokeStyle: 'rgba(255,255,255,0.3)', lineWidth: 1 }
                });
                if (i === 0) {
                    Composite.add(engine.world, Constraint.create({
                        pointA: { x: startX, y: startY - linkSize },
                        bodyB: link,
                        stiffness: 0.9,
                        render: { strokeStyle: color, lineWidth: 2 }
                    }));
                } else {
                    Composite.add(engine.world, Constraint.create({
                        bodyA: prev,
                        bodyB: link,
                        stiffness: 0.9,
                        length: linkSize,
                        render: { strokeStyle: color, lineWidth: 2 }
                    }));
                }
                Composite.add(engine.world, link);
                prev = link;
            }
        };

        createChain(width * 0.2, 50, 12, 15, '#6366f1');
        createChain(width * 0.4, 50, 15, 12, '#0ea5e9');
        createChain(width * 0.6, 50, 10, 18, '#10b981');
        createChain(width * 0.8, 50, 14, 14, '#ef4444');

        // Ground
        Composite.add(engine.world, Bodies.rectangle(width / 2, height + 25, width + 100, 50, {
            isStatic: true, render: { fillStyle: 'rgba(99, 102, 241, 0.3)' }
        }));

        // Mouse control
        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: true, strokeStyle: '#fff', lineWidth: 2 } } }));
        render.mouse = mouse;

        Render.run(render);
        Runner.run(Runner.create(), engine);

        return () => { Render.stop(render); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Drag the chains!</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click & drag to interact</span>
            </div>
            <div style={canvasContainerStyle}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

// ===================== EXPLOSION SIMULATION =====================
const ExplosionSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const [explosionPower, setExplosionPower] = useState(0.05);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 0.5;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        // Walls
        const wallOpts = { isStatic: true, render: { fillStyle: 'rgba(99, 102, 241, 0.3)' } };
        Composite.add(engine.world, [
            Bodies.rectangle(width / 2, height + 25, width + 100, 50, wallOpts),
            Bodies.rectangle(-25, height / 2, 50, height + 100, wallOpts),
            Bodies.rectangle(width + 25, height / 2, 50, height + 100, wallOpts),
            Bodies.rectangle(width / 2, -25, width + 100, 50, wallOpts)
        ]);

        // Spawn initial objects
        const colors = ['#6366f1', '#0ea5e9', '#10b981', '#eab308', '#ef4444', '#ec4899'];
        for (let i = 0; i < 60; i++) {
            const size = 15 + Math.random() * 20;
            const body = Math.random() > 0.5
                ? Bodies.circle(100 + Math.random() * (width - 200), 100 + Math.random() * (height - 300), size / 2, { restitution: 0.6, render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] } })
                : Bodies.rectangle(100 + Math.random() * (width - 200), 100 + Math.random() * (height - 300), size, size, { restitution: 0.6, render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] } });
            Composite.add(engine.world, body);
        }

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));
        render.mouse = mouse;

        Render.run(render);
        Runner.run(Runner.create(), engine);

        return () => { Render.stop(render); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    const explode = (e) => {
        if (!engineRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        Matter.Composite.allBodies(engineRef.current.world).forEach(body => {
            if (body.isStatic) return;
            const dx = body.position.x - x;
            const dy = body.position.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 300) {
                const force = explosionPower * (1 - dist / 300);
                Matter.Body.applyForce(body, body.position, { x: dx * force, y: dy * force });
            }
        });
    };

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Power:</span>
                    <input type="range" min="0.02" max="0.15" step="0.01" value={explosionPower} onChange={(e) => setExplosionPower(parseFloat(e.target.value))} style={{ width: '100px' }} />
                    <FaBomb style={{ color: '#ef4444' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click to explode!</span>
            </div>
            <div onClick={explode} style={canvasContainerStyle}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

// ===================== WIND SIMULATION =====================
const WindSimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const [windForce, setWindForce] = useState(0);

    useEffect(() => {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 0.3;

        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
            options: { width, height, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio }
        });

        // Ground only
        Composite.add(engine.world, Bodies.rectangle(width / 2, height + 25, width + 100, 50, {
            isStatic: true, render: { fillStyle: 'rgba(99, 102, 241, 0.3)' }
        }));

        // Spawn light objects (balloons/leaves)
        const colors = ['#ef4444', '#eab308', '#10b981', '#0ea5e9', '#ec4899', '#6366f1'];
        for (let i = 0; i < 40; i++) {
            const body = Bodies.circle(Math.random() * width, height - 100 - Math.random() * 200, 10 + Math.random() * 15, {
                restitution: 0.5,
                frictionAir: 0.02,
                render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] }
            });
            Composite.add(engine.world, body);
        }

        // Apply wind
        Events.on(engine, 'beforeUpdate', () => {
            Matter.Composite.allBodies(engine.world).forEach(body => {
                if (!body.isStatic) {
                    Matter.Body.applyForce(body, body.position, { x: windForce * 0.0001, y: -0.0002 });
                }
            });
        });

        const mouse = Mouse.create(render.canvas);
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.1, render: { visible: true, strokeStyle: '#fff', lineWidth: 1 } } }));
        render.mouse = mouse;

        Render.run(render);
        Runner.run(Runner.create(), engine);

        return () => { Render.stop(render); Engine.clear(engine); render.canvas.remove(); };
    }, []);

    // Update wind force dynamically
    useEffect(() => {
        if (!engineRef.current) return;
        Matter.Events.off(engineRef.current, 'beforeUpdate');
        Matter.Events.on(engineRef.current, 'beforeUpdate', () => {
            Matter.Composite.allBodies(engineRef.current.world).forEach(body => {
                if (!body.isStatic) {
                    Matter.Body.applyForce(body, body.position, { x: windForce * 0.0001, y: -0.0001 });
                }
            });
        });
    }, [windForce]);

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#0ea5e9' }}>←</span>
                    <input type="range" min="-50" max="50" value={windForce} onChange={(e) => setWindForce(parseInt(e.target.value))} style={{ width: '150px' }} />
                    <span style={{ color: '#ef4444' }}>→</span>
                    <FaWind style={{ color: 'var(--accent-color)' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Wind: {windForce > 0 ? '→' : windForce < 0 ? '←' : '○'}</span>
            </div>
            <div style={canvasContainerStyle}>
                <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

// ===================== PARTICLE SYSTEM =====================
const ParticleSystem = ({ onBack }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);
    const [mode, setMode] = useState('fountain');

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize();
        window.addEventListener('resize', resize);

        const colors = ['#6366f1', '#0ea5e9', '#10b981', '#eab308', '#ef4444', '#ec4899', '#22d3ee', '#d946ef'];
        const createParticle = (x, y, isClick = false) => ({
            x, y, vx: (Math.random() - 0.5) * (isClick ? 10 : 5), vy: isClick ? -Math.random() * 12 - 5 : -Math.random() * 4 - 1,
            size: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], alpha: 1, life: Math.random() * 120 + 100
        });

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (mode === 'fountain') for (let i = 0; i < 4; i++) particlesRef.current.push(createParticle(canvas.width / 2, canvas.height - 30));
            else if (mode === 'rain') for (let i = 0; i < 3; i++) { const p = createParticle(Math.random() * canvas.width, 0); p.vy = Math.random() * 4 + 2; p.vx = 0; particlesRef.current.push(p); }
            particlesRef.current.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--; p.alpha = p.life / 100;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha); ctx.fill(); ctx.globalAlpha = 1;
            });
            particlesRef.current = particlesRef.current.filter(p => p.life > 0 && p.y < canvas.height + 50);
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        const handleClick = (e) => {
            const rect = canvas.getBoundingClientRect();
            for (let i = 0; i < 60; i++) particlesRef.current.push(createParticle(e.clientX - rect.left, e.clientY - rect.top, true));
        };
        canvas.addEventListener('click', handleClick);

        return () => { window.removeEventListener('resize', resize); canvas.removeEventListener('click', handleClick); cancelAnimationFrame(animationRef.current); };
    }, [mode]);

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {['fountain', 'rain', 'none'].map(m => <button key={m} onClick={() => setMode(m)} style={btnStyle(mode === m)}>{m}</button>)}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click for explosions!</span>
            </div>
            <div style={canvasContainerStyle}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        </div>
    );
};

// ===================== GRAVITY SIMULATION =====================
const GravitySimulation = ({ onBack }) => {
    const canvasRef = useRef(null);
    const bodiesRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
        resize();
        window.addEventListener('resize', resize);

        const colors = ['#6366f1', '#0ea5e9', '#10b981', '#eab308', '#ef4444', '#ec4899'];
        const G = 0.5;

        bodiesRef.current = [
            { x: canvas.width / 2, y: canvas.height / 2, vx: 0, vy: 0, mass: 6000, radius: 35, color: '#fbbf24', fixed: true },
            { x: canvas.width / 2 + 180, y: canvas.height / 2, vx: 0, vy: -3.2, mass: 60, radius: 12, color: '#0ea5e9', fixed: false },
            { x: canvas.width / 2 - 240, y: canvas.height / 2, vx: 0, vy: 2.8, mass: 90, radius: 14, color: '#10b981', fixed: false },
            { x: canvas.width / 2, y: canvas.height / 2 - 300, vx: 3, vy: 0, mass: 40, radius: 10, color: '#ef4444', fixed: false },
        ];

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            bodiesRef.current.forEach((body, i) => {
                if (!body.fixed) {
                    bodiesRef.current.forEach((other, j) => {
                        if (i === j) return;
                        const dx = other.x - body.x, dy = other.y - body.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 5) return;
                        const force = (G * body.mass * other.mass) / (dist * dist);
                        body.vx += (force * dx) / (dist * body.mass);
                        body.vy += (force * dy) / (dist * body.mass);
                    });
                    body.x += body.vx; body.y += body.vy;
                }
                ctx.beginPath(); ctx.arc(body.x, body.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = body.color; ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1;
                ctx.beginPath(); ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(body.x - body.radius * 0.3, body.y - body.radius * 0.3, 0, body.x, body.y, body.radius);
                grad.addColorStop(0, 'white'); grad.addColorStop(0.3, body.color); grad.addColorStop(1, body.color);
                ctx.fillStyle = grad; ctx.shadowColor = body.color; ctx.shadowBlur = 25; ctx.fill(); ctx.shadowBlur = 0;
            });
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        const handleClick = (e) => {
            const rect = canvas.getBoundingClientRect();
            bodiesRef.current.push({
                x: e.clientX - rect.left, y: e.clientY - rect.top,
                vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
                mass: 25 + Math.random() * 70, radius: 6 + Math.random() * 12,
                color: colors[Math.floor(Math.random() * colors.length)], fixed: false
            });
        };
        canvas.addEventListener('click', handleClick);

        return () => { window.removeEventListener('resize', resize); canvas.removeEventListener('click', handleClick); cancelAnimationFrame(animationRef.current); };
    }, []);

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>🌍 Gravity Simulation</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click to add planets!</span>
            </div>
            <div style={canvasContainerStyle}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        </div>
    );
};

// ===================== SNAKE GAME =====================
const SnakeGame = ({ onBack }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameRef = useRef({ snake: [], food: {}, direction: 'right', nextDirection: 'right' });

    const startGame = useCallback(() => {
        const canvas = canvasRef.current;
        const gridSize = 20;
        const cols = Math.floor(canvas.width / gridSize);
        const rows = Math.floor(canvas.height / gridSize);
        gameRef.current = { snake: [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }], food: { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }, direction: 'right', nextDirection: 'right', gridSize, cols, rows };
        setScore(0); setGameOver(false); setGameStarted(true);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth; canvas.height = container.clientHeight;
        const handleKeyDown = (e) => {
            const { direction } = gameRef.current;
            if (e.key === 'ArrowUp' && direction !== 'down') gameRef.current.nextDirection = 'up';
            if (e.key === 'ArrowDown' && direction !== 'up') gameRef.current.nextDirection = 'down';
            if (e.key === 'ArrowLeft' && direction !== 'right') gameRef.current.nextDirection = 'left';
            if (e.key === 'ArrowRight' && direction !== 'left') gameRef.current.nextDirection = 'right';
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const game = gameRef.current;

        const gameLoop = setInterval(() => {
            game.direction = game.nextDirection;
            const head = { ...game.snake[0] };
            if (game.direction === 'up') head.y--; if (game.direction === 'down') head.y++;
            if (game.direction === 'left') head.x--; if (game.direction === 'right') head.x++;
            if (head.x < 0 || head.x >= game.cols || head.y < 0 || head.y >= game.rows || game.snake.some(s => s.x === head.x && s.y === head.y)) { setGameOver(true); return; }
            game.snake.unshift(head);
            if (head.x === game.food.x && head.y === game.food.y) { setScore(s => s + 10); game.food = { x: Math.floor(Math.random() * game.cols), y: Math.floor(Math.random() * game.rows) }; }
            else game.snake.pop();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 15;
            ctx.beginPath(); ctx.arc(game.food.x * game.gridSize + game.gridSize / 2, game.food.y * game.gridSize + game.gridSize / 2, game.gridSize / 2 - 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            game.snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? '#22d3ee' : '#10b981';
                ctx.fillRect(seg.x * game.gridSize + 1, seg.y * game.gridSize + 1, game.gridSize - 2, game.gridSize - 2);
            });
        }, 80);
        return () => clearInterval(gameLoop);
    }, [gameStarted, gameOver]);

    return (
        <div style={gameContainerStyle}>
            <div style={controlBarStyle}>
                <button onClick={onBack} style={backBtnStyle}><FaArrowLeft /> Back</button>
                <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: '600' }}>Score: {score}</span>
            </div>
            <div style={{ ...canvasContainerStyle, position: 'relative' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                {!gameStarted && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                    <h2 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>🐍 Snake</h2>
                    <button onClick={startGame} style={{ padding: '12px 30px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>Start Game</button>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '15px' }}>Use arrow keys</p>
                </div>}
                {gameOver && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
                    <h2 style={{ color: '#ef4444' }}>Game Over!</h2>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', margin: '10px 0 20px' }}>Score: {score}</p>
                    <button onClick={startGame} style={{ padding: '12px 30px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Play Again</button>
                </div>}
            </div>
        </div>
    );
};

// ===================== GAME SELECTOR =====================
const games = [
    { id: 'physics', name: 'Physics Sandbox', icon: <FaRocket />, desc: 'Drop shapes & watch physics!', color: '#6366f1' },
    { id: 'pendulum', name: "Newton's Cradle", icon: <FaLink />, desc: 'Classic pendulum physics', color: '#0ea5e9' },
    { id: 'chain', name: 'Rope Physics', icon: <FaLink />, desc: 'Drag chains around!', color: '#10b981' },
    { id: 'explosion', name: 'Explosion Sim', icon: <FaBomb />, desc: 'Click to create explosions', color: '#ef4444' },
    { id: 'wind', name: 'Wind Simulation', icon: <FaWind />, desc: 'Control the wind force', color: '#22d3ee' },
    { id: 'particles', name: 'Particles', icon: <FaBolt />, desc: 'Beautiful particle effects', color: '#ec4899' },
    { id: 'gravity', name: 'Gravity Orbits', icon: <FaGlobeAmericas />, desc: 'Planets orbiting a star', color: '#fbbf24' },
    { id: 'snake', name: 'Snake Game', icon: <FaGamepad />, desc: 'Classic snake game!', color: '#10b981' },
];

const PhysicsPlayground = () => {
    const [selectedGame, setSelectedGame] = useState(null);

    const renderGame = () => {
        const onBack = () => setSelectedGame(null);
        switch (selectedGame) {
            case 'physics': return <PhysicsSandbox onBack={onBack} />;
            case 'pendulum': return <PendulumSimulation onBack={onBack} />;
            case 'chain': return <ChainSimulation onBack={onBack} />;
            case 'explosion': return <ExplosionSimulation onBack={onBack} />;
            case 'wind': return <WindSimulation onBack={onBack} />;
            case 'particles': return <ParticleSystem onBack={onBack} />;
            case 'gravity': return <GravitySimulation onBack={onBack} />;
            case 'snake': return <SnakeGame onBack={onBack} />;
            default: return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '60px' }}>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '20px', minHeight: 'calc(100vh - 60px)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '700', background: 'linear-gradient(to right, #ffffff, var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                <FaGamepad style={{ color: 'var(--accent-color)' }} /> Physics Playground
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Choose a simulation!</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' }}>
                            {games.map((game, i) => (
                                <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedGame(game.id)}
                                    style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-color)', cursor: 'pointer', textAlign: 'center' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = game.color} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                                    <div style={{ fontSize: '2.2rem', marginBottom: '10px', color: game.color }}>{game.icon}</div>
                                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '5px' }}>{game.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{game.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100vh - 60px)' }}>
                        {renderGame()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhysicsPlayground;
