'use client'
import React from "react";
import FeatureCard from "./FeatureCard";
import FeatureTitle from "./FeatureTitle";
import FeatureDescription from "./FeatureDescription";
import { SkeletonOne } from "./SkeletonOne";
import { SkeletonTwo } from "./SkeletonTwo";
import { SkeletonThree } from "./SkeletonThree";
import { SkeletonFour } from "./SkeletonFour";
import { ShineBorder } from "@/components/ui/shine-border";


export function IntroductionSection() {
  const features = [
    {
      title: "Track issues effectively",
      description:
        "Track and manage your project issues with ease using our intuitive interface.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-[#A07CFE]",
        
    },
    {
      title: "Capture pictures with AI",
      description:
        "Capture stunning photos effortlessly using our advanced AI technology.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-[#FE8FB5]",
    },
    {
      title: "Watch our AI on YouTube",
      description:
        "Whether its you or Tyler Durden, you can get to know about our product on YouTube",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-[#FFBE7B]",
    },
    {
      title: "Deploy in seconds",
      description:
        "With our blazing fast, state of the art, cutting edge, we are so back cloud servies (read AWS) - you can deploy your model in seconds.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Packed with thousands of features
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          From Image generation to video generation, Everything AI has APIs for
          literally everything. It can even create this website copy for you.
        </p>
      </div>
      <div className="relative">
       <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
     <div className="grid grid-cols-1 lg:grid-cols-6 mt-12">
       {features.map((feature) => (
      <FeatureCard key={feature.title} className={feature.className}>
        <FeatureTitle>{feature.title}</FeatureTitle>
        <FeatureDescription>{feature.description}</FeatureDescription>
        <div className=" h-full w-full">{feature.skeleton}</div>
      </FeatureCard>
       ))}
    </div>
      </div>
    </div>
  );
}






