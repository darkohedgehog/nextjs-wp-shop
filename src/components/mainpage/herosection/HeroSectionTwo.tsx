"use client";
import { motion } from "motion/react";
import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MdOutlinePhoneForwarded } from "react-icons/md";
import Link from "next/link";

export function HeroSectionTwo() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-8 pb-4 md:px-8">
        <div className="relative mt-20 flex flex-col items-center justify-center">
          <FeaturedImages />
          <h1 className="mb-8 relative mx-auto mt-4 max-w-6xl text-center text-3xl font-bold tracking-tight text-zinc-300 md:text-4xl lg:text-7xl">
          Opremite svoj dom s našim  {" "}
            <span className="relative z-10 bg-linear-to-b from-indigo-700 to-indigo-600 bg-clip-text text-transparent">
            vrhunskim proizvodima
            </span>{" "}
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block h-14 w-14 stroke-indigo-500 stroke-[1px]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <motion.path
                  initial={{ pathLength: 0, fill: "#a5b4fc", opacity: 0 }}
                  animate={{ pathLength: 1, fill: "#a5b4fc", opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                  d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
                />
              </svg>
            </span>
          </h1>
          <h2 className="font-regular relative mx-auto mt-8 mb-8 max-w-xl text-center text-base tracking-wide text-zinc-200 antialiased md:text-xl">
           Naša web trgovina nudi širok asortiman proizvoda koji kombinuju funkcionalnost i stil, zadovoljavajući sve vaše potrebe za elektro galanterijom.
          </h2>
        </div>
        <div className="group relative z-10 mb-10">
          <Link href='/contact'>
          <button
           type="button"
           className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] font-semibold">
            Kontakt
            <span><MdOutlinePhoneForwarded className="w-5 h-5" /></span>
          </button>
          </Link>
        </div>
        <LogoCloudMarquee />
      </div>
      <ImagesGrid />
    </div>
  );
}

export const ImagesGrid = () => {
  const images = [
    {
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/emorio.png",
      className: "translate-y-10",
    },
    {
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/happy.png",
      className: "translate-y-20",
    },

    {
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/kombo.png",
      className: "translate-y-4",
    },
    {
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/setq.png",
      className: "translate-y-10",
    },
    {
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/razdjelnik.png",
      className: "translate-y-20",
    },
  ];
  return (
    <div className="relative mt-10 h-80 w-full overflow-hidden border-b border-color md:h-120">
      <div className="absolute inset-0 flex h-full w-full shrink-0 justify-center gap-5">
        {images.map((image) => (
          <div
            className={cn(
              "relative mt-0 rounded-lg border border-border-color bg-linear-to-b from-indigo-700 to-indigo-600 p-2",
              image.className,
            )}
            key={image.src}
          >
            <Image
              src={image.src}
              alt={image.src}
              width="500"
              height="500"
              priority
              className="h-full min-w-60 shrink-0 rounded-lg object-cover object-top"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const FeaturedImages = ({
  className,
  containerClassName,
}: {
  textClassName?: string;
  className?: string;
  showStars?: boolean;
  containerClassName?: string;
}) => {
  const images = [
    {
      name: "Kamera Commel",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/05/270-151-scaled-1.jpg",
    },
    {
      name: "Uticnica Happy",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/04/16.36.052.jpg",
    },
    {
      name: "Uticnica SET-Q",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/04/12.23.051.jpg",
    },
    {
      name: "Trofazno-monofazni razdjelnik",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/04/trofazno-monofazni-razvodnik.jpg",
    },
    {
      name: "Sklopka Emporio",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/04/17.01.007.jpg",
    },
    {
      name: "Razdjelnik",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/04/05.63.81.jpg",
    },
  ];
  return (
    <div className={cn("flex flex-col items-center", containerClassName)}>
      <div
        className={cn(
          "mb-2 flex flex-col items-center justify-center sm:flex-row",
          className,
        )}
      >
        <div className="mb-4 flex flex-row items-center sm:mb-0">
          {images.map((image) => (
            <div className="group relative -mr-4" key={image.name}>
              <div>
                <motion.div
                  whileHover={{ scale: 1.05, zIndex: 30 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-full border-2 border-color"
                >
                  <Image
                    height={100}
                    width={100}
                    src={image.src}
                    alt={image.name}
                    priority
                    className="h-8 w-8 object-cover object-top md:h-14 md:w-14"
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function LogoCloudMarquee() {
  const logos = [
    {
      name: "Metalka Majur",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/metalka-logo.png",
    },
    {
      name: "Nopallux",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/nopallux_logo.jpeg",
    },
    {
      name: "Tehnoelektro-Tim",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/tehnoelektro-logo.png",
    },
    {
      name: "Elid Elektroindustrija",
      src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/elid.png",
    },
  ];

  return (
    <div className="relative">
      <p className="mt-4 text-center font-sans text-base text-neutral-200">
        Kvaliteta koja traje
      </p>

      <div className="relative mx-auto mt-4 flex h-20 w-full max-w-4xl flex-wrap justify-center gap-10 mask-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] md:mt-2 md:gap-40">
      <Marquee pauseOnHover direction="left" speed={30}>
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex flex-col items-center mx-6 md:mx-10"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={100}
                height={100}
                priority
                className="w-12 h-12 md:w-40 object-contain"
              />
              <span className="mt-2 text-sm md:text-md text-neutral-400 whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}