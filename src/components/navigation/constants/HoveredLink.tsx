import Link from "next/link";

export const HoveredLink = ({ children, ...rest }: any) => {
    return (
      <Link
        {...rest}
        className="text-neutral-200 hover:text-black"
      >
        {children}
      </Link>
    );
  };