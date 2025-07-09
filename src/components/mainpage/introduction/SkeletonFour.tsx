import { Globe } from "./Globe";

export const SkeletonFour = () => {
    return (
      <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
        <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
      </div>
    );
  };
  