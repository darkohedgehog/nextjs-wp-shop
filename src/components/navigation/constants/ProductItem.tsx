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
        priority
        className="shrink-0 rounded-md shadow-2xl w-36 h-32"
      />
      <div>
        <h4 className="mb-1 text-base font-normal text-zinc-200">
          {title}
        </h4>
        <p className="max-w-40 text-sm text-zinc-300">
          {description}
        </p>
      </div>
    </Link>
  );
};