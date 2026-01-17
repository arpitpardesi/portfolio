import React, { useRef, useEffect } from 'react';

const Background = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];

        const starCount = 200;
        const connectionDistance = 100;
        const mouseDistance = 150;

        let mouse = { x: null, y: null };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random(); // Depth factor: 0 (far) to 1 (near)

                // Far stars are smaller and slower
                this.size = (1 - this.z) * 1.5 + 0.5;
                this.baseVx = (Math.random() - 0.5) * 0.2 * (1 - this.z);
                this.baseVy = (Math.random() - 0.5) * 0.2 * (1 - this.z);

                this.vx = this.baseVx;
                this.vy = this.baseVy;

                this.alpha = (1 - this.z) * 0.8 + 0.2;
                this.color = `rgba(255, 255, 255, ${this.alpha})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (mouse.x != null) {
                    const parallaxX = (mouse.x - width / 2) * 0.0002 * (1 - this.z);
                    const parallaxY = (mouse.y - height / 2) * 0.0002 * (1 - this.z);

                    this.x += -parallaxX;
                    this.y += -parallaxY;

                    if (this.z < 0.3) {
                        let dx = mouse.x - this.x;
                        let dy = mouse.y - this.y;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouseDistance) {
                            const force = (mouseDistance - dist) / mouseDistance;
                            this.vx += (dx / dist) * force * 0.02;
                            this.vy += (dy / dist) * force * 0.02;
                        }
                    }
                }

                this.vx += (this.baseVx - this.vx) * 0.05;
                this.vy += (this.baseVy - this.vy) * 0.05;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
                stars[i].draw();

                if (stars[i].z < 0.3) {
                    const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '99, 102, 241';

                    for (let j = i; j < stars.length; j++) {
                        if (stars[j].z < 0.3) {
                            const dx = stars[i].x - stars[j].x;
                            const dy = stars[i].y - stars[j].y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < connectionDistance) {
                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(${accentRgb}, ${1 - dist / connectionDistance})`;
                                ctx.lineWidth = 0.5;
                                ctx.moveTo(stars[i].x, stars[i].y);
                                ctx.lineTo(stars[j].x, stars[j].y);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        resize();
        init();
        animate();

        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'linear-gradient(to bottom, #000000, #1a1a2e)',
            }}
        />
    );
};

export default Background;