import { cn } from "@/lib/utils";

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
    return (
      <p
        className={cn(
          "text-sm md:text-base  max-w-4xl text-left mx-auto",
          "text-center font-normal paragraph-color",
          "text-left max-w-sm mx-0 md:text-lg my-2"
        )}
      >
        {children}
      </p>
    );
  };

  export default FeatureDescription;