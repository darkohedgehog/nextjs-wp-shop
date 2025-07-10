import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const navItems = [
    {
      name: "Izbornik",
      link: "/",
      children: [
        { name: "Naslovna", link: "/" },
        { name: "O nama", link: "/about" },
        { name: "Kontakt", link: "/contact" },
      ],
    },
    {
      name: "Trgovina",
      link: "/products",
      products: [
        {
          title: "Proizvodi",
          href: "/products",
          src: "https://assets.aceternity.com/demos/algochurn.webp",
          description: "Prepare for tech interviews like never before.",
        },
        {
          title: "Kategorije",
          href: "/categories",
          src: "https://assets.aceternity.com/demos/tailwindmasterkit.webp",
          description: "Production ready Tailwind css components for your next project",
        },
      ],
    },
    {
      name: "Nalog",
      link: "/my-account",
      children: [
        { name: "Prijava", link: "/my-account/login" },
        { name: "Registracija", link: "/my-account/register" },
        { name: "Moj račun", link: "/my-account" },
      ],
    },
  ];

  return (
    <div className="w-full">
      <DesktopNav navItems={navItems} />
      <MobileNav navItems={navItems} />
    </div>
  );
};
export default Navbar;