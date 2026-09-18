"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieAnimation = () => {
  return (
    <DotLottieReact
      // Keep layout independent of the canvas's rounded pixel dimensions at fractional zoom.
      className="w-full aspect-[2/1]"
      src="/Animation-1719066570102.lottie"
      loop
      autoplay
    />
  );
};

export default LottieAnimation;
