import React from "react";
import { cn } from "@/lib/utils";

const FeatureCard = ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
        {children}
      </div>
    );
  };

  export default FeatureCard;