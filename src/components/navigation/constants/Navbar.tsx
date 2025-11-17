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
          src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/hedgehog1000_an_ecommerce_who_sells_an_elecric_material_realist_0e83b2f2-f680-4503-ad02-79f620be34ab.webp",
          description: "Priuštite sebi kvalitetu",
        },
        {
          title: "Kategorije",
          href: "/categories",
          src: "https://wp.zivic-elektro.shop/wp-content/uploads/2025/11/CategoryBanner2.png",
          description: "Istražite naše proizvode",
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