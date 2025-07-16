import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import Image from "next/image";

const image = '/assets/covercamera.png';

export const SkeletonThree = () => {


    return (
      <a
        href="https://www.youtube.com/watch?v=k8zLN4XOUuk&t=21s"
        target="__blank"
        className="relative flex gap-10  h-full group/image"
      >
        <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
          <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
            {/* TODO */}
            <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
            <Image
              src={image}
              alt="header"
              width={800}
              height={800}
              priority
              className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200 mb-11"
            />
          </div>
        </div>
      </a>
    );
  };