import React from 'react';
import TypewriterEffectHero from './TypewriterEffetHero';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 md:pt-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-10">
        
        <div className="flex-1">
          <TypewriterEffectHero />
        </div>
        
        <div className="flex-1 flex justify-center md:justify-end">
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px]">
            <Image 
              src="/cover.png"
              alt="hero image"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection;