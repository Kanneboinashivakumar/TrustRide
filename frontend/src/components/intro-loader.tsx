import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroLoaderProps {
  onComplete?: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'counting' | 'dot' | 'typing' | 'done'>('counting');
  const [typedText, setTypedText] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const targetText = 'TrustRide';

  useEffect(() => {
    let countVal = 0;

    const runCounter = () => {
      if (countVal < 20) {
        countVal += 1;
        setCount(countVal);
        setTimeout(runCounter, 45); // Fast counting 0 -> 20
      } else if (countVal === 20) {
        // Dramatic pause at 20 before moving to 21
        setTimeout(() => {
          countVal = 21;
          setCount(21);
          // Pause at 21 before showing centered dot
          setTimeout(() => {
            setPhase('dot');
          }, 450);
        }, 180); // Time difference between 20 and 21
      }
    };

    runCounter();
  }, []);

  // Typewriter phase: 21 -> 21 · -> 21 · TrustRide
  useEffect(() => {
    if (phase === 'dot') {
      const dotTimer = setTimeout(() => {
        setPhase('typing');
      }, 350);
      return () => clearTimeout(dotTimer);
    }

    if (phase === 'typing') {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < targetText.length) {
          setTypedText(targetText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setPhase('done');

          // Hold full "21 · TrustRide" for user to enjoy before dissolve
          setTimeout(() => {
            setIsDismissed(true);
            if (onComplete) onComplete();
          }, 1200);
        }
      }, 70);

      return () => clearInterval(typeInterval);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] bg-[#000000] text-white flex items-center justify-center select-none overflow-hidden"
        >
          <div className="flex items-center justify-center">
            {phase === 'counting' ? (
              // Clean Crisp Number Counter 00 -> 20 -> 21
              <span className="text-8xl sm:text-9xl md:text-[180px] font-extralight tracking-[-0.04em] text-white leading-none font-sans">
                {String(count).padStart(2, '0')}
              </span>
            ) : (
              // Luxury Typewriter Reveal: 21 -> 21 · -> 21 · TrustRide
              <div className="text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-white flex items-center gap-2 sm:gap-4 font-sans">
                <span className="text-blue-400 font-extralight">21</span>

                {(phase === 'dot' || phase === 'typing' || phase === 'done') && (
                  <span className="text-blue-400/90 text-4xl sm:text-6xl md:text-7xl leading-none select-none">
                    ·
                  </span>
                )}

                {(phase === 'typing' || phase === 'done') && (
                  <span className="font-light tracking-[0.02em] bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent ml-1">
                    {typedText}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroLoader;
