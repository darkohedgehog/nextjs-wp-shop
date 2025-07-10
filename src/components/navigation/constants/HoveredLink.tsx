import Link from "next/link";
import { cn } from "@/lib/utils";

type HoveredLinkProps = React.ComponentProps<typeof Link>;

export const HoveredLink = ({ children, className, ...rest }: HoveredLinkProps) => {
  return (
    <Link
      {...rest}
      className={cn("text-neutral-200 hover:text-black", className)}
    >
      {children}
    </Link>
  );
};