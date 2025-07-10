import Link from "next/link";
import Image from "next/image";

export const ProductItem = ({
  title,
  description,
  link,
  src,
}: {
  title: string;
  description: string;
  link: string;
  src: string;
}) => {
  return (
    <Link href={link} className="flex gap-4">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="mb-1 text-base font-normal text-white">
          {title}
        </h4>
        <p className="max-w-[10rem] text-sm text-neutral-100">
          {description}
        </p>
      </div>
    </Link>
  );
};