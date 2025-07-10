import Link from "next/link";
import Image from "next/image";

const Logo = () => {
    return (
      <Link
        href="/"
        className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={70}
          height={60}
          priority
          className="h-auto w-auto object-cover"
        />
      </Link>
    );
  };
export default Logo;