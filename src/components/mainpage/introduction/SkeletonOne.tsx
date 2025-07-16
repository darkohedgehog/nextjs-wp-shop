import Image from "next/image";

export const SkeletonOne = () => {
    return (
      <div className="relative flex py-8 px-2 gap-10 h-full">
        <div className="w-full  p-5  mx-auto shadow-2xl group h-full">
          <div className="flex flex-1 w-full h-full flex-col space-y-2">
            {/* TODO */}
            <Image
              src="/assets/CategoryBanner2.png"
              alt="header"
              width={400}
              height={400}
              priority
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
        </div>
  
        <div className="absolute bottom-0 z-40 inset-x-0 h-60 w-full pointer-events-none rounded-lg" style={{ background: 'linear-gradient(to top, var(--primary-color), transparent)' }} />
 
        <div className="absolute top-0 z-40 inset-x-0 h-60 w-full pointer-events-none rounded-lg" style={{ background: 'linear-gradient(to bottom, var(--secondary-color), transparent)' }} />
      </div>
    );
  };