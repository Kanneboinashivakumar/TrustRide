import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { 
  Zap, Menu, X, ShieldAlert, RotateCcw, FileX, Terminal, ShieldCheck, FileCheck, 
  CheckCircle2, Activity, Map as MapIcon, Radio, Users, Scale, User, 
  Github, Twitter, Linkedin, ChevronDown, Lock, Shield, FileText,
  Server, Fingerprint, RefreshCw, Key, ArrowRight, ExternalLink,
  Car, Battery, Wifi, Eye, BarChart3, HelpCircle, BookOpen, Code, ActivityIcon,
  AlertTriangle, Database, Globe, Cpu, BadgeCheck, LockKeyhole, Layers, Sparkles,
  Maximize2, Minimize2, Check, Code2, CpuIcon
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { SargamERickshawHero3D } from '@/components/blueprint-3d/sargam-rickshaw-hero-3d';
import { IntroLoader } from '@/components/intro-loader';

// ═══════════════════════════════════════════════════
// ANIMATED CANVAS BACKGROUND — Vehicle Network
// ═══════════════════════════════════════════════════

interface CanvasNode {
  x: number; y: number; vx: number; vy: number; radius: number; opacity: number;
}
interface CanvasPulse {
  fromIdx: number; toIdx: number; progress: number; speed: number;
}

const NetworkCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<CanvasNode[]>([]);
  const pulsesRef = useRef<CanvasPulse[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const initNodes = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 25000);
    const nodes: CanvasNode[] = [];
    for (let i = 0; i < Math.min(count, 80); i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1, opacity: Math.random() * 0.4 + 0.2,
      });
    }
    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      initNodes(rect.width, rect.height);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;
      const pulses = pulsesRef.current;

      for (const node of nodes) {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));
        const dx = node.x - mouseRef.current.x;
        const dy = node.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) { node.x += (dx / dist) * 0.3; node.y += (dy / dist) * 0.3; }
      }

      const maxDist = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${(1 - dist / maxDist) * 0.08})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath(); ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${node.opacity})`; ctx.fill();
        ctx.beginPath(); ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
        grad.addColorStop(0, `rgba(59, 130, 246, ${node.opacity * 0.15})`);
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = grad; ctx.fill();
      }

      if (Math.random() < 0.008 && nodes.length > 1) {
        const from = Math.floor(Math.random() * nodes.length);
        let to = Math.floor(Math.random() * nodes.length);
        while (to === from) to = Math.floor(Math.random() * nodes.length);
        const dx = nodes[from].x - nodes[to].x;
        const dy = nodes[from].y - nodes[to].y;
        if (Math.sqrt(dx * dx + dy * dy) < maxDist * 1.5) {
          pulses.push({ fromIdx: from, toIdx: to, progress: 0, speed: 0.008 + Math.random() * 0.006 });
        }
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.progress += p.speed;
        if (p.progress > 1) { pulses.splice(i, 1); continue; }
        const from = nodes[p.fromIdx]; const to = nodes[p.toIdx];
        if (!from || !to) { pulses.splice(i, 1); continue; }
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.9)'; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pg.addColorStop(0, 'rgba(37, 99, 235, 0.3)'); pg.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = pg; ctx.fill();
      }

      const time = Date.now() * 0.001;
      for (let i = 0; i < 3; i++) {
        const sx = (Math.sin(time * 0.2 + i * 2.1) * 0.3 + 0.5) * w;
        const sy = (Math.cos(time * 0.15 + i * 1.7) * 0.3 + 0.5) * h;
        const sa = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * 0.04;
        ctx.save(); ctx.translate(sx, sy); ctx.scale(1.2, 1.2);
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, -5); ctx.lineTo(8, 4);
        ctx.quadraticCurveTo(0, 12, 0, 12); ctx.quadraticCurveTo(0, 12, -8, 4); ctx.lineTo(-8, -5); ctx.closePath();
        ctx.strokeStyle = `rgba(148, 163, 184, ${sa})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouse); };
  }, [initNodes]);

  return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

// ═══════════════════════════════════════════════════
// ANIMATED COUNTER HOOK (With Delay Support)
// ═══════════════════════════════════════════════════

const useCountUp = (end: number, duration: number = 2000, inView: boolean, delayMs: number = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) { 
      setCount(0); 
      return; 
    }
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [end, duration, inView, delayMs]);

  return count;
};

// ═══════════════════════════════════════════════════
// MICRO-LABEL
// ═══════════════════════════════════════════════════

const MicroLabel: React.FC<{ children: React.ReactNode; light?: boolean; className?: string }> = ({ children, light, className }) => (
  <span className={cn("text-[11px] uppercase tracking-[0.14em] font-semibold", light ? "text-blue-400" : "text-blue-600", className)}>
    {children}
  </span>
);

// ═══════════════════════════════════════════════════
// SCROLL ARROW PATH COMPONENT (Stable Angle & Tangent Tracking)
// ═══════════════════════════════════════════════════

const ScrollArrowPath: React.FC<{
  d: string;
  progress: MotionValue<number>;
  opacity: MotionValue<number>;
}> = ({ d, progress, opacity }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [tip, setTip] = useState({ x: 0, y: 0, angle: 0, visible: false });

  useMotionValueEvent(progress, "change", (val) => {
    const path = pathRef.current;
    if (!path) return;
    if (val <= 0.005) {
      setTip(prev => ({ ...prev, visible: false }));
      return;
    }
    const len = path.getTotalLength();
    const currentLen = val * len;
    
    const sampleDist = 2;
    let p1: DOMPoint, p2: DOMPoint;
    if (currentLen >= len - sampleDist) {
      p1 = path.getPointAtLength(len - sampleDist);
      p2 = path.getPointAtLength(len);
    } else {
      p1 = path.getPointAtLength(currentLen);
      p2 = path.getPointAtLength(currentLen + sampleDist);
    }
    
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
    setTip({ x: p2.x, y: p2.y, angle, visible: true });
  });

  return (
    <g>
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ pathLength: progress, opacity }}
      />
      {tip.visible && (
        <g transform={`translate(${tip.x}, ${tip.y}) rotate(${tip.angle})`}>
          <polygon points="-10,-5 2,0 -10,5" fill="#2563eb" />
        </g>
      )}
    </g>
  );
};

// ═══════════════════════════════════════════════════
// 1. NAVIGATION
// ═══════════════════════════════════════════════════

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-500",
      scrolled ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className={cn("p-1.5 rounded-lg transition-all duration-300 flex items-center justify-center",
            scrolled ? "bg-blue-600 text-white" : "bg-blue-500/20 text-blue-400 backdrop-blur-sm border border-blue-400/30"
          )}>
            <Zap size={18} className="fill-current" />
          </div>
          <span className={cn("font-bold text-lg tracking-tight transition-colors duration-300 flex items-center leading-none",
            scrolled ? "text-slate-900" : "text-white"
          )}>TrustRide</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: 'Features', href: '#features' },
            { name: 'Architecture', href: '#architecture' },
            { name: 'Security', href: '#security' },
            { name: 'Compliance', href: '#compliance' },
            { name: 'Roadmap', href: '#pricing' },
          ].map((item) => (
            <a key={item.name} href={item.href} className={cn(
              "text-[11px] uppercase tracking-[0.08em] font-semibold transition-colors duration-300",
              scrolled ? "text-slate-500 hover:text-slate-900" : "text-slate-300 hover:text-white"
            )}>{item.name}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className={cn("text-[11px] uppercase tracking-[0.08em] font-semibold transition-colors duration-300",
            scrolled ? "text-slate-500 hover:text-slate-900" : "text-slate-300 hover:text-white"
          )}>Demo Access</a>
          <a href="/app/dashboard" className="px-5 py-2.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.45)]">
            Launch Demo
          </a>
        </div>
        <button className={cn("md:hidden transition-colors", scrolled ? "text-slate-600" : "text-white")} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 overflow-hidden">
            <div className="px-6 py-6 flex flex-col gap-1">
              {[
                { name: 'Features', href: '#features' },
                { name: 'Architecture', href: '#architecture' },
                { name: 'Security', href: '#security' },
                { name: 'Compliance', href: '#compliance' },
                { name: 'Roadmap', href: '#pricing' },
              ].map((item) => (
                <a key={item.name} href={item.href} className="text-[13px] uppercase tracking-[0.06em] font-semibold text-slate-600 py-3 border-b border-slate-100">{item.name}</a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <a href="/login" className="text-center py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full">Demo Access</a>
                <a href="/app/dashboard" className="text-center py-3 text-sm font-semibold text-white bg-blue-600 rounded-full">Launch Demo</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ═══════════════════════════════════════════════════
// 2. HERO — Sleek Balanced Headline Typography
// ═══════════════════════════════════════════════════

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#060a12] via-[#0a0f1a] to-[#111827]">
      <NetworkCanvas className="pointer-events-auto" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,10,18,0.4)_70%)]" />
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* Left Column: Headline & CTAs */}
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }} className="lg:col-span-6 text-center lg:text-left">
            
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-4">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Inspired by recent incidents highlighting the risks of remotely managed electric vehicle systems.</span>
              </div>
              <MicroLabel light className="mb-4 block">Zero-Trust Remote Vehicle Governance</MicroLabel>
            </motion.div>
            
            <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-bold text-white tracking-[-0.025em] leading-[1.12] mb-6">
              Secure Every Remote Command.<br />
              <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent font-extrabold">
                Trust Every Vehicle.
              </span>
            </motion.h1>

            <motion.p variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              className="text-base md:text-lg text-slate-300/90 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Cryptographically verify every remote command before it reaches the vehicle — using multi-signature approvals, motion safety enforcement, and immutable audit trails.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="/app/dashboard" className="w-full sm:w-auto px-8 py-4 text-[12px] uppercase tracking-[0.08em] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.45)] flex items-center justify-center gap-2">
                Launch Demo <ArrowRight size={16} />
              </a>
              <a href="/judge-demo" className="w-full sm:w-auto px-8 py-4 text-[12px] uppercase tracking-[0.08em] font-semibold text-white border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
                Explore Architecture <ExternalLink size={14} />
              </a>
            </motion.div>

          </motion.div>

          {/* Right Column: 3D GLTF Rotating Sargam E-Rickshaw Model */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
            className="lg:col-span-6 relative flex items-center justify-center">
            <SargamERickshawHero3D className="w-full" />
          </motion.div>

        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060a12] to-transparent" />
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 3. PROBLEM — Synchronized Scroll
// ═══════════════════════════════════════════════════

const Problem = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.25", "end 0.85"]
  });

  const card1Opacity = useTransform(scrollYProgress, [0.0, 0.12], [0, 1]);
  const card1Y = useTransform(scrollYProgress, [0.0, 0.12], [30, 0]);

  const path1Progress = useTransform(scrollYProgress, [0.12, 0.32], [0, 1]);
  const path1Opacity = useTransform(scrollYProgress, [0.12, 0.15], [0, 1]);

  const card2Opacity = useTransform(scrollYProgress, [0.32, 0.40], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.32, 0.40], [30, 0]);

  const path2Progress = useTransform(scrollYProgress, [0.40, 0.60], [0, 1]);
  const path2Opacity = useTransform(scrollYProgress, [0.40, 0.43], [0, 1]);

  const card3Opacity = useTransform(scrollYProgress, [0.60, 0.72], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.60, 0.72], [30, 0]);

  const path1 = "M 420,110 C 650,110 500,490 720,490";
  const path2 = "M 720,580 C 490,580 640,840 420,840";

  return (
    <section className="py-24 md:py-36 bg-[#fafbfc] overflow-hidden" ref={sectionRef}>
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="mb-20 text-center md:text-left">
          <MicroLabel className="mb-4 block">The Challenge</MicroLabel>
          <h2 className="text-3xl md:text-[44px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1] max-w-2xl">
            Remote vehicle commands are a critical attack surface.
          </h2>
        </div>

        <div className="relative min-h-[1180px] md:min-h-[1100px] flex flex-col md:block">
          
          <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <ScrollArrowPath d={path1} progress={path1Progress} opacity={path1Opacity} />
            <ScrollArrowPath d={path2} progress={path2Progress} opacity={path2Opacity} />
          </svg>

          {/* CARD 1 */}
          <motion.div style={{ opacity: card1Opacity, y: card1Y }} className="md:absolute md:top-0 md:left-0 w-full md:w-[420px] mb-8 md:mb-0 z-20">
            <div className="bg-white rounded-2xl p-7 md:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono font-bold text-red-500 block mb-2">Vulnerability 01</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Unauthorized Access</h3>
              <p className="text-slate-600 leading-relaxed text-[14.5px] mb-4">
                Without cryptographic identity and key pair verification, unauthenticated command packets can be injected directly into the simulated vehicle communication layer.
              </p>
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Unauthenticated remote command injection</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Zero cryptographic proof of command origin</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 2 */}
          <motion.div style={{ opacity: card2Opacity, y: card2Y }} className="md:absolute md:top-[380px] md:right-0 w-full md:w-[420px] mb-8 md:mb-0 z-20">
            <div className="bg-white rounded-2xl p-7 md:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono font-bold text-amber-500 block mb-2">Vulnerability 02</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Replay Attacks</h3>
              <p className="text-slate-600 leading-relaxed text-[14.5px] mb-4">
                Previously authorized valid command packets can be captured and re-transmitted by malicious actors, executing unmonitored actions unless rejected by nonce and timestamp freshness checks.
              </p>
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Captured payload re-transmission risks</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Bypasses static token authentication</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 3 */}
          <motion.div style={{ opacity: card3Opacity, y: card3Y }} className="md:absolute md:top-[840px] md:left-0 w-full md:w-[420px] z-20">
            <div className="bg-white rounded-2xl p-7 md:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono font-bold text-slate-500 block mb-2">Vulnerability 03</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">No Accountability</h3>
              <p className="text-slate-600 leading-relaxed text-[14.5px] mb-4">
                Without immutable audit trails, determining operator liability, verifying multi-signature approvals, or auditing remote vehicle actions after security incidents is impossible.
              </p>
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Missing non-repudiation audit records</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Inability to determine command origin or approval chain</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 4. STATISTICS
// ═══════════════════════════════════════════════════

const Statistics = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.25 });

  const vehicleCount = useCountUp(12, 1000, isInView, 0);
  const commandCount = useCountUp(24, 1200, isInView, 0);

  return (
    <section className="py-24 md:py-36 bg-[#0a0f1a]" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(8px)' }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <MicroLabel light className="mb-4 block">Research Prototype</MicroLabel>
          <h2 className="text-3xl md:text-[44px] font-bold text-white tracking-tight">
            Built for command governance simulation.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono text-blue-400 font-semibold block mb-2">Demo Fleet</span>
              <div className="text-[52px] lg:text-[64px] font-extrabold text-white tracking-[-0.03em] leading-none mb-3 tabular-nums">
                {vehicleCount} Connected
              </div>
              <div className="text-base font-semibold text-slate-200">Simulated Commercial EV Fleet</div>
            </div>
            <p className="mt-6 text-sm text-slate-400 border-t border-white/10 pt-4">
              Real-time zero-trust hardware keys evaluated across a simulated commercial electric vehicle fleet.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="md:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono text-blue-400 font-semibold block mb-2">Verified Demo Commands</span>
              <div className="text-[44px] font-extrabold text-white tracking-[-0.03em] leading-none mb-3 tabular-nums">
                {commandCount}
              </div>
              <div className="text-base font-semibold text-slate-200">Simulated Dispatches</div>
            </div>
            <p className="mt-6 text-xs text-slate-400 border-t border-white/10 pt-4">
              Actual simulated command count across active demo vehicles.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="md:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono text-emerald-400 font-semibold block mb-2">Audit Integrity</span>
              <div className="text-[44px] font-extrabold text-[#34d399] tracking-[-0.03em] leading-none mb-3 tabular-nums">
                SHA-256
              </div>
              <div className="text-base font-semibold text-slate-200">Hash Chain Enabled</div>
            </div>
            <p className="mt-6 text-xs text-slate-400 border-t border-white/10 pt-4">
              7 Security Checks Active on every command dispatch.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.7, delay: 0.55 }}
            className="md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase tracking-[0.14em] font-mono text-cyan-400 font-semibold block mb-2">Verification Architecture</span>
              <div className="text-[52px] font-extrabold text-[#38bdf8] tracking-[-0.03em] leading-none mb-3 tabular-nums">
                7 Stages
              </div>
              <div className="text-base font-semibold text-slate-200">Zero-Trust Pipeline</div>
            </div>
            <p className="mt-6 text-sm text-slate-400 border-t border-white/10 pt-4">
              Cryptographic verification pipeline running in isolated simulation environment.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 5. SOLUTION — Interactive Expanding 3-Card Fan Deck
// ═══════════════════════════════════════════════════

const Solution = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    { 
      icon: Terminal, 
      title: 'Command Creation', 
      desc: 'Authorized operators draft commands with explicit legal grounds, motion threshold safety tags, and multi-user consensus criteria.', 
      num: '01',
      badge: 'RBAC ENFORCED',
      codeSnippet: '{\n  "action": "IMMOBILIZE",\n  "vin": "1FTVW1EL5NW08129",\n  "motionCheck": true,\n  "sig": "0x8f...3a"\n}',
      expandedContent: [
        'Multi-factor role-based access validation',
        'Justification log & supervisor sign-off',
        'ECDSA hardware key pair signing'
      ]
    },
    { 
      icon: ShieldCheck, 
      title: 'Multi-Stage Verification', 
      desc: 'Every packet travels through 7 cryptographic validation gates including ECDSA P-256 signature verification, timestamp freshness, and Nonce Replay Checks.', 
      num: '02',
      badge: '7-STAGE PIPELINE',
      codeSnippet: '[\n  "ECDSA_P256_VERIFIED",\n  "FRESHNESS_CHECK_PASS",\n  "NONCE_REPLAY_CHECK_PASS",\n  "MOTION_SAFE_0KMH"\n]',
      expandedContent: [
        'Timestamp freshness window check (<30s)',
        'Nonce uniqueness via Nonce Replay Check',
        'Simulated vehicle communication layer speed check'
      ]
    },
    { 
      icon: FileCheck, 
      title: 'Immutable Audit', 
      desc: 'Execution results and telemetry metadata are cryptographically appended to an unalterable SHA-256 Hash Chain Ledger designed to align with AIS-156 & UNECE R155.', 
      num: '03',
      badge: 'SHA-256 HASH CHAIN',
      codeSnippet: '{\n  "block": 1829402,\n  "previousEntryHash": "0x3e...9a",\n  "ais156Aligned": true\n}',
      expandedContent: [
        'SHA-256 block hash chain generation',
        'Non-repudiation cryptographic proof',
        'Designed to align with AIS-156 & UNECE R155 regulations'
      ]
    },
  ];

  return (
    <section className="py-24 md:py-36 bg-[#05060f] relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(186,215,247,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(186,215,247,0.04)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300 mb-4">
            <Sparkles size={13} className="text-blue-400 animate-pulse" />
            <span className="uppercase tracking-[0.1em] font-mono text-[11px] font-semibold">ZERO-TRUST ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl md:text-[54px] font-bold text-white tracking-tight leading-[1.12] max-w-3xl mx-auto">
            Every command is cryptographically verified.
          </h2>
          <p className="text-[#9da7ba] text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            Every command passes through a verifiable security workflow before execution.
          </p>

          <button onClick={() => setIsExpanded(!isExpanded)}
            className="mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] cursor-pointer">
            {isExpanded ? <><Minimize2 size={15} /> Collapse Card Stack</> : <><Maximize2 size={15} /> Click Card Deck to Expand Full Architecture</>}
          </button>
        </motion.div>

        <div className="relative min-h-[580px] max-w-[1300px] mx-auto flex justify-center items-center">
          <div className={cn("w-full transition-all duration-700 ease-in-out", isExpanded ? "grid md:grid-cols-3 gap-8 lg:gap-10 items-stretch" : "relative h-[520px] max-w-4xl mx-auto flex items-center justify-center cursor-pointer")}
            onClick={() => { if (!isExpanded) setIsExpanded(true); }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const fanStyles = [
                "absolute left-2 md:left-6 top-6 rotate-[-7deg] z-10 hover:z-30 hover:rotate-0 hover:scale-105 opacity-90",
                "relative z-20 scale-100 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-blue-400/50",
                "absolute right-2 md:right-6 top-6 rotate-[7deg] z-10 hover:z-30 hover:rotate-0 hover:scale-105 opacity-90"
              ];

              return (
                <motion.div key={idx} layout transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
                  className={cn("bg-[#080b1e] backdrop-blur-2xl rounded-[24px] p-8 md:p-10 border border-slate-700/60 relative transition-all duration-300 group hover:border-blue-400 hover:bg-[#0c102c] hover:shadow-[0_0_60px_rgba(59,130,246,0.35)] flex flex-col justify-between",
                    !isExpanded ? fanStyles[idx] + " w-[360px] md:w-[430px] h-[500px]" : "w-full min-h-[500px]")}>
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-blue-500/15 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-7 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all">
                        <Icon size={26} />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-blue-300 px-3 py-1 rounded-md bg-white/5 border border-white/10">
                        {step.badge}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <span className="text-[11px] uppercase tracking-wider text-blue-400 font-mono font-bold block mb-1.5">Stage {step.num}</span>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-[#9da7ba] leading-relaxed text-[15px] mb-6">{step.desc}</p>
                    </div>

                    {isExpanded && (
                      <div className="mb-6 pt-4 border-t border-white/10 space-y-2 relative z-10">
                        {step.expandedContent.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-[12px] text-blue-300 relative z-10 overflow-x-auto group-hover:border-blue-500/40 transition-colors">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold flex items-center justify-between">
                      <span>Payload Inspection</span>
                      <Code2 size={14} className="text-blue-400" />
                    </div>
                    <pre className="whitespace-pre">{step.codeSnippet}</pre>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 6. INTERACTIVE WORKFLOW — Fey AI-Style Vertical Accordion Deck (Image Reference)
// ═══════════════════════════════════════════════════

const InteractiveWorkflow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });
  const [activeStage, setActiveStage] = useState(5); // Stage 6 Insider/ECU Execution default

  const stages = [
    { title: 'Signature Verification', tag: 'ECDSA P-256', desc: 'Validates cryptographic signatures using Simulated Hardware Security Module (HSM) key pairs.', icon: Fingerprint },
    { title: 'Freshness Check', tag: '<30s Window', desc: 'Validates timestamp delta window against synchronized hardware clocks.', icon: RefreshCw },
    { title: 'Replay Protection', tag: 'Nonce Replay Check', desc: 'Checks payload nonce uniqueness against non-repudiation replay cache.', icon: Key },
    { title: 'Multi-signature Authorization', tag: 'Quorum Signatures', desc: 'Evaluates multi-party quorum approvals and organizational roles.', icon: Shield },
    { title: 'Motion Safety Check', tag: 'Vehicle Speed Sensor', desc: 'Queries vehicle speed sensors to confirm 0 km/h stationary safety state.', icon: Activity },
    { title: 'Vehicle Execution', tag: 'Simulated Execution', desc: 'Dispatches signed instructions to simulated vehicle communication layer.', icon: Server },
    { title: 'SHA-256 Hash Chain Audit', tag: 'SHA-256 Ledger', desc: 'Appends command execution log to tamper-proof SHA-256 hash chain ledger.', icon: FileText },
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % stages.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isInView, stages.length]);

  return (
    <section className="py-28 md:py-40 bg-[#02040a] text-white relative overflow-hidden" id="architecture" ref={ref}>
      
      {/* Laser Glow Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-gradient-to-r from-blue-600/15 via-cyan-500/20 to-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header (Matching Fey AI Image: "One a few more things.") */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <MicroLabel light className="mb-3 block">Cryptographic Pipeline Stream</MicroLabel>
          <h2 className="text-3xl md:text-[46px] font-extrabold text-white tracking-tight leading-[1.12]">
            Seven Stages of Cryptographic Verification
          </h2>
          <p className="text-slate-400 text-base mt-3 max-w-xl mx-auto">
            Hover over any card below to expand its complete verification workflow.
          </p>
        </motion.div>

        {/* FEY-STYLE INTERACTIVE VERTICAL ACCORDION CARD DECK (Matching Image Reference Exactly) */}
        <div className="hidden md:flex gap-3 max-w-[1180px] mx-auto h-[440px] items-stretch justify-center">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = activeStage === idx;

            return (
              <motion.div
                key={idx}
                onMouseEnter={() => setActiveStage(idx)}
                onClick={() => setActiveStage(idx)}
                layout
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className={cn(
                  "rounded-2xl p-6 border transition-all duration-500 relative overflow-hidden cursor-pointer flex flex-col justify-between select-none shrink-0",
                  isActive
                    ? "w-[420px] bg-gradient-to-b from-[#0e172a] via-[#091124] to-[#040814] border-cyan-400/80 shadow-[0_0_50px_rgba(56,189,248,0.3)] z-20"
                    : "w-[85px] bg-[#070b17]/80 hover:bg-[#0d1429] border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                )}
              >
                {/* Active Inner Glow Radial Gradient */}
                {isActive && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_70%)] pointer-events-none" />
                )}

                {/* Collapsed State: Vertical Rotated Label & Icon */}
                {!isActive ? (
                  <div className="h-full flex flex-col justify-between items-center py-2 relative z-10">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">0{idx + 1}</span>
                    {/* Vertical text label running top-to-bottom along the box height */}
                    <div className="[writing-mode:vertical-rl] text-xs font-semibold text-slate-300 tracking-[0.15em] uppercase whitespace-nowrap my-auto">
                      {stg.title}
                    </div>
                    {/* Icon box at the bottom horizontal place */}
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-1">
                      <Icon size={16} />
                    </div>
                  </div>
                ) : (
                  /* Expanded Active Card Detail Panel (Matching Fey Image Layout) */
                  <div className="h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-inner">
                          <Icon size={24} />
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                          {stg.tag}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                        Stage 0{idx + 1} Verification Gate
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{stg.title}</h3>
                      <p className="text-slate-300 text-xs leading-relaxed mb-6">{stg.desc}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-cyan-300">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold flex items-center justify-between">
                        <span>Payload Inspection</span>
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      </div>
                      <div className="text-slate-300">Status: <span className="text-emerald-400 font-bold">PASSED</span> (0.4ms)</div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">Cryptographic Proof Hash: 0x8a7f...e291</div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: Vertical Stage Cards */}
        <div className="md:hidden space-y-3">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = activeStage === idx;
            return (
              <div key={idx} onClick={() => setActiveStage(idx)}
                className={cn("p-4 rounded-xl border text-left flex items-start gap-3 transition-all",
                  isActive ? "bg-blue-950/80 border-cyan-400 text-white" : "bg-[#070b17] border-slate-800 text-slate-400")}>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-0.5">Stage 0{idx + 1}</span>
                  <h4 className="text-xs font-bold text-white mb-1">{stg.title}</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 7. FEATURES — Horizontal Infinite Scrolling Marquee
// ═══════════════════════════════════════════════════

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  const featuresList = [
    { icon: CheckCircle2, title: 'Multi-Signature Approvals', desc: 'Require consensus from multiple authorized users for high-risk commands.' },
    { icon: Activity, title: 'Motion Safety Engine', desc: 'Prevent dangerous commands when vehicle telemetry indicates unsafe conditions.' },
    { icon: MapIcon, title: 'Digital Twin', desc: 'Real-time virtual representation of your fleet status and command history.' },
    { icon: Radio, title: 'Real-Time Fleet Tracking', desc: 'Live monitoring of vehicle locations, network states, and connectivity.' },
    { icon: ShieldAlert, title: 'Attack Simulation', desc: 'Simulated environment evaluating attack vectors and replay prevention.' },
    { icon: Users, title: 'Role-Based Access Control', desc: 'Granular permissions ensuring users only execute commands authorized for their role.' },
    { icon: Scale, title: 'Compliance Mapping', desc: 'Automated reporting designed to align with AIS-156, ISO 26262, UNECE R155, and ISO/SAE 21434.' },
    { icon: User, title: 'Driver Portal', desc: 'Allow vehicle operators to view active command requests and provide consent.' },
  ];

  const doubled = [...featuresList, ...featuresList];

  return (
    <section className="py-24 md:py-32 bg-[#fafbfc] overflow-hidden" id="features" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} transition={{ duration: 0.7 }}>
          <MicroLabel className="mb-4 block">Capabilities</MicroLabel>
          <h2 className="text-3xl md:text-[44px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1] max-w-xl">
            Prototype vehicle governance capabilities.
          </h2>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafbfc] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafbfc] to-transparent z-10 pointer-events-none" />
        
        <motion.div className="flex gap-6" animate={{ x: ['0%', '-50%'] }} transition={{ x: { duration: 40, repeat: Infinity, ease: 'linear' } }}>
          {doubled.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="min-w-[300px] max-w-[300px] bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-blue-200 transition-all duration-300 shrink-0 group hover:shadow-lg hover:shadow-blue-500/5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 tracking-tight">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 8. PRODUCT PREVIEW — ContainerScroll
// ═══════════════════════════════════════════════════

const ProductPreview = () => {
  return (
    <section className="bg-white overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <MicroLabel className="mb-4 block">Platform</MicroLabel>
            <h2 className="text-3xl md:text-[44px] lg:text-[52px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1]">
              One Platform. Complete Vehicle Governance.
            </h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">
              Real-time fleet monitoring, command verification, threat detection, and immutable audit trails — all in one pane of glass.
            </p>
          </div>
        }
      >
        <div className="w-full h-full bg-white p-2 md:p-4 overflow-hidden">
          <div className="flex h-full rounded-xl overflow-hidden border border-slate-200">
            <div className="w-48 bg-[#0a0f1a] p-4 hidden md:flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center gap-2 mb-6 px-1">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <Zap size={12} className="text-white fill-white" />
                </div>
                <span className="text-white text-xs font-bold">TrustRide</span>
              </div>
              {[
                { icon: BarChart3, label: 'Dashboard', active: true },
                { icon: Car, label: 'Fleet', active: false },
                { icon: MapIcon, label: 'Digital Twin', active: false },
                { icon: Terminal, label: 'Commands', active: false },
                { icon: ShieldAlert, label: 'Threat Sandbox', active: false },
                { icon: FileCheck, label: 'Audit', active: false },
              ].map((item, i) => (
                <div key={i} className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[11px] font-medium",
                  item.active ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-slate-300"
                )}>
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 p-4 md:p-5 bg-slate-50 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fleet Governance Console</h3>
                  <p className="text-[10px] text-slate-400">Real-time zero-trust command stream</p>
                </div>
                <div className="flex gap-2">
                  <a href="/app/dashboard" className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-semibold rounded-full">+ New Command</a>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Demo Fleet', value: '12', change: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Motion Safety', value: 'Active', change: '0 km/h Enforced', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Hash Chain', value: 'Enabled', change: 'SHA-256 Ledger', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Replay Attempts Blocked', value: '4', change: '7/7 Stages OK', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                  <div key={i} className={cn("rounded-lg p-3 border", stat.bg, "border-transparent")}>
                    <p className="text-[9px] text-slate-500 font-medium mb-1">{stat.label}</p>
                    <p className="text-base font-bold text-slate-900">{stat.value}</p>
                    <p className={cn("text-[9px] font-semibold mt-0.5", stat.color)}>{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                  {['Vehicle', 'Status', 'Battery', 'Location', 'Hash Chain', 'Verification'].map((h) => (
                    <span key={h} className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                {[
                  { name: 'Sargam Electric Rickshaw', plate: 'MH-12-ER-1001', status: 'Active', statusColor: 'bg-emerald-500', battery: '87%', location: 'Pune, MH', score: '✓ Verified', lastCmd: 'Passed' },
                  { name: 'Mahindra Treo', plate: 'KA-01-TR-2002', status: 'Charging', statusColor: 'bg-blue-500', battery: '42%', location: 'Bengaluru, KA', score: '✓ Verified', lastCmd: 'Passed' },
                  { name: 'Piaggio Ape E-City', plate: 'DL-01-AP-3003', status: 'Active', statusColor: 'bg-emerald-500', battery: '73%', location: 'New Delhi, DL', score: '✓ Verified', lastCmd: 'Passed' },
                  { name: 'Euler HiLoad EV', plate: 'HR-26-EU-4004', status: 'Idle', statusColor: 'bg-amber-500', battery: '91%', location: 'Gurugram, HR', score: '✓ Verified', lastCmd: 'Passed' },
                ].map((v, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 px-3 py-2.5 border-b border-slate-50 items-center">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-900">{v.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{v.plate}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", v.statusColor)} />
                      <span className="text-[10px] text-slate-600">{v.status}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">{v.battery}</span>
                    <span className="text-[10px] text-slate-500">{v.location}</span>
                    <span className="text-[10px] font-semibold text-emerald-600">{v.score}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600">{v.lastCmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 9. SECURITY — Standardized Threat Cards
// ═══════════════════════════════════════════════════

const Security = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  const threats = [
    { title: 'MITM Protection', desc: 'End-to-end cryptographic verification using ECDSA P-256 key pair signatures.', icon: Lock, stat: 'ECDSA P-256', statLabel: 'Signatures' },
    { title: 'Nonce Replay Protection', desc: 'Nonce-based freshness checks block previously-captured commands from re-execution.', icon: RotateCcw, stat: '<30s', statLabel: 'Freshness Window' },
    { title: 'Role-Based Authorization', desc: 'Granular role-based access control and multi-signature authorization at every layer.', icon: ShieldAlert, stat: 'Multi-Sig', statLabel: 'Role Control' },
    { title: 'Payload Integrity', desc: 'SHA-256 Hash Chain Ledger detects any modification to command data in transit.', icon: FileCheck, stat: 'SHA-256', statLabel: 'Hash Ledger' },
    { title: 'Simulated GPS Spoofing', desc: 'Cross-reference location telemetry with simulated vehicle communication sensors.', icon: MapIcon, stat: 'Simulated', statLabel: 'Spoof Detection' },
    { title: 'Attack Simulation', desc: 'Simulate and evaluate attack vectors in an isolated sandbox environment.', icon: Users, stat: 'Isolated', statLabel: 'Attack Simulation' },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#0a0f1a]" id="security" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} transition={{ duration: 0.7 }} className="mb-16 md:mb-20">
          <MicroLabel light className="mb-4 block">Security</MicroLabel>
          <h2 className="text-3xl md:text-[44px] font-bold text-white tracking-[-0.02em] leading-[1.1] max-w-xl">
            Built to withstand sophisticated attacks.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {threats.map((threat, idx) => {
            const Icon = threat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/40 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Icon size={20} className="text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-white">{threat.stat}</div>
                    <div className="text-[9px] uppercase font-mono text-slate-500">{threat.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{threat.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{threat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 10. COMPLIANCE — Enterprise Title
// ═══════════════════════════════════════════════════

const Compliance = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const [activeStandard, setActiveStandard] = useState<number | null>(0);

  const standards = [
    { name: 'AIS-156', desc: 'Indian EV battery safety and electrical safety standards — Designed to align with', icon: BadgeCheck, chip: 'ALIGNED' },
    { name: 'ISO 26262', desc: 'Automotive functional safety for electrical & electronic systems — Designed to align with', icon: Shield, chip: 'ALIGNED' },
    { name: 'UNECE R155', desc: 'Cybersecurity management system & vehicle risk mitigation — Designed to align with', icon: Globe, chip: 'ALIGNED' },
    { name: 'ISO/SAE 21434', desc: 'Road vehicle cybersecurity engineering & risk management — Designed to align with', icon: Cpu, chip: 'ALIGNED' },
  ];

  return (
    <section className="py-24 md:py-36 bg-[#fafbfc] overflow-hidden" id="compliance" ref={ref}>
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7 }}
            className="lg:col-span-5 text-center lg:text-left">
            <MicroLabel className="mb-4 block">Compliance Evidence Mapping</MicroLabel>
            <h2 className="text-3xl md:text-[44px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1] mb-6">
              Designed to align with global EV security standards.
            </h2>
            <p className="text-base text-slate-500 leading-relaxed mb-8">
              TrustRide provides automated cryptographic evidence mapping designed to align with AIS-156, ISO 26262, UNECE R155, and ISO/SAE 21434 regulations.
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {standards.map((std, i) => (
                <button key={std.name} onClick={() => setActiveStandard(i)}
                  className={cn("px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2",
                    activeStandard === i ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  )}>
                  <span>{std.name}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono font-bold", activeStandard === i ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600")}>{std.chip}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 relative flex items-center justify-center min-h-[400px]">
            
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-blue-100 flex items-center justify-center relative">
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border border-blue-200/60 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center p-4 text-center shadow-xl shadow-blue-500/20">
                  <ShieldCheck size={28} className="mb-1" />
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-80">Evidence</span>
                  <span className="text-xs font-bold">Mapping</span>
                </div>
              </div>

              {standards.map((std, idx) => {
                const angle = (idx * 360) / standards.length;
                const rad = (angle * Math.PI) / 180;
                const radius = 140;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                const Icon = std.icon;
                const isHovered = activeStandard === idx;

                return (
                  <div key={idx} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
                    style={{ transform: `translate(${x}px, ${y}px)` }} onMouseEnter={() => setActiveStandard(idx)}>
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                      className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap shadow-xs",
                        isHovered ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-110" : "bg-white text-slate-700 border-slate-200 hover:border-blue-400")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors",
                        isHovered ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600")}>
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-semibold tracking-tight">{std.name}</span>
                    </motion.div>
                  </div>
                );
              })}
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// PRICING / ROADMAP SECTION
// ═══════════════════════════════════════════════════

const Pricing = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });

  const tiers = [
    {
      name: 'Prototype',
      tag: 'Current Phase',
      price: 'v1.0',
      period: ' Prototype',
      desc: 'Hackathon & research demonstration prototype.',
      features: [
        'Interactive 3D E-Rickshaw WebGL Viewer',
        '7-Stage verification pipeline simulation',
        'Multi-signature approval workflow',
        'SHA-256 Hash Chain audit log browser',
        'Simulated Hardware Security Module (HSM)'
      ],
      highlighted: false,
      cta: 'Explore Prototype'
    },
    {
      name: 'Pilot Deployment',
      tag: 'Phase 2',
      price: 'v2.0',
      period: ' Pilot',
      desc: 'Commercial fleet sandbox testing & IoT gateway integration.',
      features: [
        'Live Express backend API connectivity',
        'ECDSA P-256 key pair provisioning',
        'Real-time WebSocket telemetry ingestion',
        'Simulated vehicle communication layer',
        'Designed to align with AIS-156 & UNECE R155'
      ],
      highlighted: true,
      cta: 'View Architecture'
    },
    {
      name: 'Enterprise Integration',
      tag: 'Phase 3',
      price: 'v3.0',
      period: ' Roadmap',
      desc: 'Commercial OEM hardware integration & Hardware Security Module (HSM) deployment.',
      features: [
        'Physical Hardware Security Module (HSM) keys',
        'Custom N-of-M multi-signature quorums',
        'Direct vehicle ECU communication channel',
        'Threat Sandbox telemetry suite',
        'Automated AIS-156 & UNECE R155 evidence export'
      ],
      highlighted: false,
      cta: 'Read Roadmap'
    }
  ];

  return (
    <section className="py-28 md:py-40 bg-[#02040a] text-white relative overflow-hidden" id="pricing" ref={ref}>
      
      {/* Watermark Background Typography */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[140px] md:text-[220px] font-black text-transparent bg-gradient-to-b from-blue-500/15 via-blue-600/5 to-transparent bg-clip-text select-none pointer-events-none tracking-tight z-0">
        Roadmap
      </div>

      {/* Ambient Radial Blue Glowing Mesh Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <MicroLabel light className="mb-3 block">Prototype Roadmap</MicroLabel>
          <h2 className="text-3xl md:text-[48px] font-extrabold text-white tracking-tight">
            Conceptual Prototype Roadmap
          </h2>
        </motion.div>

        {/* 3 Glassmorphism Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "rounded-[32px] p-8 transition-all duration-300 flex flex-col justify-between relative backdrop-blur-2xl border",
                tier.highlighted
                  ? "bg-white/[0.06] border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                  : "bg-white/[0.03] border-white/15 hover:border-white/30"
              )}
            >
              <div>
                {/* Title & Tag */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-slate-300 block mb-1">{tier.tag}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{tier.price}</span>
                    <span className="text-slate-400 text-sm font-mono">{tier.period}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-8 leading-relaxed min-h-[36px]">{tier.desc}</p>

                {/* Feature checklist */}
                <div className="space-y-3.5 mb-8 pt-6 border-t border-white/10">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="/app/dashboard"
                className="w-full py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block"
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 11. FAQ
// ═══════════════════════════════════════════════════

const FAQ = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: 'What is TrustRide?', a: 'TrustRide is a zero-trust remote vehicle command governance platform for commercial electric vehicles. It enforces 7-stage cryptographic verification, multi-signature authorizations, and motion safety checks before any remote command is executed.' },
    { q: 'How does the verification pipeline work?', a: 'Every command passes through seven stages: cryptographic signature validation, timestamp freshness, nonce-based replay protection, RBAC authorization, motion safety verification, vehicle execution, and immutable audit recording.' },
    { q: 'What types of vehicles are supported?', a: 'TrustRide supports commercial EV fleets including electric 3-wheelers (rickshaws), cargo haulers, and commercial passenger EVs.' },
    { q: 'How does multi-signature approval work?', a: 'For high-risk commands like immobilizing a vehicle, you configure policies requiring approval from multiple authorized personnel before the command is dispatched.' },
    { q: 'Is TrustRide compliant with automotive regulations?', a: 'Yes. Our platform architecture is designed to align with AIS-156, ISO 26262, UNECE R155, and ISO/SAE 21434 standards.' },
    { q: 'Can I integrate with existing fleet management?', a: 'TrustRide provides REST APIs and webhooks to seamlessly integrate with fleet management and dispatch systems.' },
  ];

  return (
    <section className="py-24 md:py-36 bg-white overflow-hidden" id="faq" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <MicroLabel className="mb-4 block">FAQ</MicroLabel>
          <h2 className="text-3xl md:text-[44px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: idx * 0.08 }} className="border-b border-slate-200">
              <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)} className="w-full py-6 flex items-center justify-between text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                {faq.q}
                <ChevronDown size={18} className={cn("transition-transform duration-300 text-slate-400", openIdx === idx && "rotate-180")} />
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden">
                    <p className="pb-6 text-slate-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 12. CTA
// ═══════════════════════════════════════════════════

const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section className="py-24 md:py-36 bg-[#fafbfc] border-t border-slate-200" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 80 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }} transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}>
          <MicroLabel className="mb-6 block font-mono">Platform Access</MicroLabel>
          <h2 className="text-[36px] md:text-[52px] lg:text-[64px] font-bold text-slate-900 tracking-[-0.03em] leading-[1.05] mb-6">
            Ready to explore TrustRide?
          </h2>
          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
            Experience secure remote command governance through the TrustRide research prototype.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/app/dashboard" className="w-full sm:w-auto px-10 py-4 text-[12px] uppercase tracking-[0.08em] font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.45)]">
              Launch Demo
            </a>
            <a href="/judge-demo" className="w-full sm:w-auto px-10 py-4 text-[12px] uppercase tracking-[0.08em] font-mono font-semibold text-slate-600 border border-slate-300 hover:border-slate-400 rounded-full transition-all duration-300">
              View Architecture
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// 13. FOOTER
// ═══════════════════════════════════════════════════

const Footer = () => {
  return (
    <footer className="bg-[#0a0f1a] text-slate-400">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Zap size={16} className="fill-current" /></div>
              <span className="font-bold text-lg tracking-tight text-white font-mono">TrustRide</span>
            </div>
            <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
              Zero-Trust Remote Vehicle Governance. Secure, verify, and audit every remote command sent to your fleet.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors duration-300"><Icon size={18} /></a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: [{ label: 'Features', href: '#features' }, { label: 'Architecture', href: '#architecture' }, { label: 'Security', href: '#security' }, { label: 'Compliance', href: '#compliance' }, { label: 'Roadmap', href: '#pricing' }] },
            { title: 'Prototypes & Demos', links: [{ label: 'Dashboard Demo', href: '/app/dashboard' }, { label: 'Architecture Specs', href: '/judge-demo' }, { label: 'Scenario Simulator', href: '/app/scenario-simulator' }, { label: 'GitHub Repository', href: 'https://github.com' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.12em] font-mono font-semibold text-slate-400 mb-5">{col.title}</h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-slate-500 hover:text-white transition-colors duration-300">{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-800/60 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">&copy; {new Date().getFullYear()} Built by Team TrustRide — Research Prototype & Hackathon Demonstration.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-mono text-xs">Research Prototype — Simulated Environment Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ═══════════════════════════════════════════════════
// TIMELINE & MOTIVATION
// ═══════════════════════════════════════════════════
const TimelineMotivation = () => (
  <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="text-center mb-12">
        <MicroLabel className="mb-2 block text-blue-400">Security Journey</MicroLabel>
        <h2 className="text-3xl md:text-4xl font-bold">End-to-End Command Governance Flow</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
        {[
          { step: '01', title: 'Real-world Motivation', desc: 'Remote EV command vulnerabilities' },
          { step: '02', title: 'Remote Command Risk', desc: 'Unauthorized or stale payloads' },
          { step: '03', title: 'TrustRide Verification', desc: '7-stage ECDSA & motion safety checks' },
          { step: '04', title: 'Safe Execution', desc: 'Vehicle receives validated command' },
          { step: '05', title: 'Permanent Audit', desc: 'Appended to SHA-256 Hash Chain' },
        ].map((s) => (
          <div key={s.step} className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-xs font-mono text-blue-400 font-bold">{s.step}</span>
            <h4 className="text-base font-semibold mt-1 mb-1">{s.title}</h4>
            <p className="text-xs text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════
// BEFORE VS AFTER
// ═══════════════════════════════════════════════════
const BeforeVsAfter = () => (
  <section className="py-24 bg-[#FAFBFD] border-t border-b border-slate-200/80">
    <div className="max-w-[1200px] mx-auto px-6 font-sans">
      {/* SECTION HEADER */}
      <div className="text-center mb-14">
        <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-blue-600 mb-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
          Architecture Comparison
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          WITHOUT TrustRide <span className="text-slate-400 font-light">vs</span> WITH TrustRide
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2.5 font-normal">
          See how TrustRide adds enterprise-grade <span className="font-semibold text-slate-700">security, safety,</span> and <span className="font-semibold text-slate-700">accountability</span> at every step of remote command execution.
        </p>
      </div>

      {/* 2 COMPARISON CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT CARD: WITHOUT TRUSTRIDE */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-7 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* CARD BADGE */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider mb-8">
              <AlertTriangle size={14} className="shrink-0 text-rose-600" />
              <span>WITHOUT TRUSTRIDE</span>
            </div>

            {/* TIMELINE STEPS */}
            <div className="relative space-y-8 pl-2">
              {/* Connecting Vertical Line */}
              <div className="absolute left-[21px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-rose-200 z-0" />

              {/* STEP 01 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Operator Command</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Command is sent from operator without strong verification</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-rose-500 shrink-0 ml-4">01</span>
              </div>

              {/* STEP 02 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Vehicle Executes Directly</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Vehicle accepts and executes the command blindly</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-rose-500 shrink-0 ml-4">02</span>
              </div>

              {/* STEP 03 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <X size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">No Security Checks</h4>
                    <p className="text-xs text-slate-500 mt-0.5">No quorum, no validation, no audit trail</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-rose-500 shrink-0 ml-4">03</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SUMMARY PILL */}
          <div className="mt-10 p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-center space-x-2 text-rose-700 font-bold text-xs">
            <AlertTriangle size={16} className="shrink-0" />
            <span>High Risk • Unsafe • No Accountability</span>
          </div>
        </div>

        {/* RIGHT CARD: WITH TRUSTRIDE */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-7 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* CARD BADGE */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
              <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
              <span>WITH TRUSTRIDE</span>
            </div>

            {/* TIMELINE STEPS */}
            <div className="relative space-y-7 pl-2">
              {/* Connecting Vertical Line */}
              <div className="absolute left-[21px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-emerald-200 z-0" />

              {/* STEP 01 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Operator Command</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Command created with intent and context</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-emerald-600 shrink-0 ml-4">01</span>
              </div>

              {/* STEP 02 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Cryptographic Verification</h4>
                    <p className="text-xs text-slate-500 mt-0.5">ECDSA P-256 signature & nonce validation</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-emerald-600 shrink-0 ml-4">02</span>
              </div>

              {/* STEP 03 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Multi-Signature Authorization</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Dual approver quorum (2-of-2) verification</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-emerald-600 shrink-0 ml-4">03</span>
              </div>

              {/* STEP 04 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Motion Safety Interlock</h4>
                    <p className="text-xs text-slate-500 mt-0.5">0 km/h enforcement before execution</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-emerald-600 shrink-0 ml-4">04</span>
              </div>

              {/* STEP 05 */}
              <div className="relative z-10 flex items-start justify-between group">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Secure Execution & Audit</h4>
                    <p className="text-xs text-slate-500 mt-0.5">SHA-256 hash chain audit & immutable log</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-extrabold text-emerald-600 shrink-0 ml-4">05</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SUMMARY PILL */}
          <div className="mt-8 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-center space-x-2 text-emerald-700 font-bold text-xs">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Secure • Safe • Verified • Accountable</span>
          </div>
        </div>

      </div>

      {/* 4-COLUMN BENEFIT BAR BELOW CARDS */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs">Zero-Trust Security</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Every command is verified before execution</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs">Enterprise Governance</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Multi-sig approvals and policy controls</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <FileCheck size={18} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs">Tamper-Proof Audit</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Immutable SHA-256 hash chain ledger</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs">Safety First</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Vehicle safety ensured with motion interlock</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════
// WHO BENEFITS
// ═══════════════════════════════════════════════════
const WhoBenefits = () => (
  <section className="py-20 bg-slate-50 border-t border-slate-200">
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="text-center mb-12">
        <MicroLabel className="mb-2 block">Target Stakeholders</MicroLabel>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Who Benefits from TrustRide?</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Commercial EV Operators', desc: 'Secure daily fleet dispatch & remote lock workflows.' },
          { title: 'Fleet Managers', desc: 'Centralized multi-signature approval policy controls.' },
          { title: 'NBFCs & Financiers', desc: 'Authorized loan-default recovery with motion safety.' },
          { title: 'EV OEMs', desc: 'Standardized zero-trust security & regulatory alignment.' },
          { title: 'Government Fleets', desc: 'Immutable SHA-256 audit log non-repudiation.' },
        ].map((b, i) => (
          <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-2">{b.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <IntroLoader />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Statistics />
        <TimelineMotivation />
        <Solution />
        <BeforeVsAfter />
        <InteractiveWorkflow />
        <Features />
        <WhoBenefits />
        <ProductPreview />
        <Security />
        <Compliance />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
