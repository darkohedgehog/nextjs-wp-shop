'use client'
import FeatureCard from "./FeatureCard";
import FeatureTitle from "./FeatureTitle";
import FeatureDescription from "./FeatureDescription";
import { SkeletonOne } from "./SkeletonOne";
import { SkeletonTwo } from "./SkeletonTwo";
import { SkeletonThree } from "./SkeletonThree";
import { SkeletonFour } from "./SkeletonFour";
import { ShineBorder } from "@/components/ui/shine-border";
import Link from "next/link";
import { FaTruckFast } from "react-icons/fa6";
import { MdWorkspacePremium } from "react-icons/md";


export function IntroductionSection() {
  const features = [
    {
      title: "Kategorije proizvoda",
      href: "/categories",
      description:
        "Istražite našu trgovinu i otkrijte savršene proizvode za vaš dom",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-[#A07CFE]",
        
    },
    {
      title: "Istražite našu ponudu",
      href: "/products",
      description:
        "Posjetite nas sada i uljepšajte svoj dom s našim vrhunskim proizvodima",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-[#FE8FB5]",
    },
    {
      title: "WiFi smart vanjska kamera",
      description:
        "Laka kontrola kamere preko aplikacije i vašeg mobitela",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-[#FFBE7B]",
    },
    {
      title: "Budimo u kontaktu",
      href: "/contact",
      description:
        "Trebate pomoć ili savjet? Slobodno nas pozovite ili posjetite",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium secondary-color">
          Moderan izgled vašeg doma
        </h4>

        <div className="flex items-center justify-center text-lg lg:text-xl  max-w-2xl  my-4 mx-auto text-center font-normal paragraph-color gap-2">
        <span className="flex items-center justify-center gap-2"><FaTruckFast /> Brza dostava</span> 
        | <span className="flex items-center justify-center gap-2"><MdWorkspacePremium />Kvalitet proizvoda</span>
        </div>
      </div>
      <div className="relative">
       <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
     <div className="grid grid-cols-1 lg:grid-cols-6 mt-12">
     {features.map((feature) => (
     <FeatureCard key={feature.title} className={feature.className}>
       <FeatureTitle>
        {feature.href ? (
          <Link href={feature.href} className="hover:underline secondary-color">
          {feature.title}
          </Link>
           ) : (
          feature.title
        )}
        </FeatureTitle>
    <FeatureDescription>{feature.description}</FeatureDescription>
    <div className="h-full w-full">{feature.skeleton}</div>
  </FeatureCard>
))}
    </div>
      </div>
    </div>
  );
}






