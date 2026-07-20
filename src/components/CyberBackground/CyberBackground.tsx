import { useEffect, useRef } from 'react';
import './CyberBackground.css';

const BABY_EMOJIS = ['🧸', '🎈', '⭐', '💕', '🍼', '☁️', '🌙', '🎀', '🦋', '🌸', '👶', '🧸'];

interface FloatingItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  pulse: number;
  pulseSpeed: number;
}

const CyberBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let items: FloatingItem[] = [];
    let isVisible = true;
    let lastFrameTime = 0;
    const TARGET_FPS = 20;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const itemCount = 14;
    const connectionDistance = 100;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      items = [];
      for (let i = 0; i < itemCount; i++) {
        items.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.15 - 0.08,
          emoji: BABY_EMOJIS[Math.floor(Math.random() * BABY_EMOJIS.length)],
          size: Math.random() * 12 + 10,
          opacity: Math.random() * 0.25 + 0.1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.004 + Math.random() * 0.006,
        });
      }
    };

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };

    const animate = (timestamp: number) => {
      if (!ctx || !canvas) return;

      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;
      if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.rotationSpeed;
        item.pulse += item.pulseSpeed;

        if (item.x < -40) item.x = canvas.width + 40;
        if (item.x > canvas.width + 40) item.x = -40;
        if (item.y < -40) item.y = canvas.height + 40;
        if (item.y > canvas.height + 40) item.y = -40;

        const pulseFactor = 1 + Math.sin(item.pulse) * 0.1;
        const currentSize = item.size * pulseFactor;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.globalAlpha = item.opacity * (0.9 + Math.sin(item.pulse) * 0.1);
        ctx.font = `${currentSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
        ctx.restore();

        // Conexões limitadas
        if (i % 3 === 0) {
          for (let j = i + 1; j < items.length; j++) {
            const item2 = items[j];
            const dx = item.x - item2.x;
            const dy = item.y - item2.y;
            const distanceSq = dx * dx + dy * dy;
            const maxDistSq = connectionDistance * connectionDistance;

            if (distanceSq < maxDistSq) {
              const distance = Math.sqrt(distanceSq);
              const alpha = (1 - distance / connectionDistance) * 0.08;
              ctx.beginPath();
              ctx.strokeStyle = '#ff6b9d';
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 0.5;
              ctx.moveTo(item.x, item.y);
              ctx.lineTo(item2.x, item2.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    };

    init();
    animationFrameId = requestAnimationFrame(animate);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div className="baby-background">
      <canvas ref={canvasRef} className="baby-canvas" />
      <div className="bg-blobs">
        <div className="blob blob-lavender"></div>
      </div>
    </div>
  );
};

export default CyberBackground;
