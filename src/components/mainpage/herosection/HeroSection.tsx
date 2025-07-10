'use client'
import React, { useEffect } from 'react';
import TypewriterEffectHero from './TypewriterEffetHero';
import Image from 'next/image';
import { useAnimate, useInView } from 'motion/react';

const HeroSection = () => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        scope.current,
        {
          transform: ['translateX(300px)', 'translateX(0px)'],
          opacity: [0, 1],
        },
        {
          duration: 1.5,
          delay: 2.0, // ✅ veći delay
          ease: 'easeOut',
        }
      );
    }
  }, [isInView, animate, scope]);

  return (
    <section className="max-w-7xl mx-auto px-4 -mt-32 md:mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        
        <div className="flex items-center justify-center min-w-[200px]">
          <TypewriterEffectHero />
        </div>
        
        <div
          ref={scope}
          className="flex justify-center md:justify-end opacity-0"
          style={{ transform: 'translateX(300px)' }} // ✅ initial transform ovde
        >
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px] -mt-60 md:mt-0 lg:mt-0">
            <Image 
              src="/cover.png"
              alt="hero image"
              width={500}
              height={500}
              className="object-contain bg-no-repeat w-auto h-auto"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection;