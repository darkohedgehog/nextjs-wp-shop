import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import Image from "next/image";

const image = '/assets/covercamera.png';

export const SkeletonThree = () => {


    return (
      <a
        href="https://www.youtube.com/watch?v=k8zLN4XOUuk&t=21s"
        target="__blank"
        className="relative flex gap-10 h-full group/image"
      >
        <div className="w-full mx-auto bg-transparent group h-full">
          <div className="flex flex-1 w-full h-full flex-col space-y-2 relative">
            {/* TODO */}
            <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
            <Image
              src={image}
              alt="camera"
              width={400}
              height={400}
              priority
              className="h-full w-full aspect-square object-cover object-center rounded-md blur-none group-hover/image:blur-md transition-all duration-200 mb-20"
            />
          </div>
        </div>
      </a>
    );
  };