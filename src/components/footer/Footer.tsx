import Link from "next/link";
import {
  FiFacebook
} from "react-icons/fi";
import {
  RiMessengerLine,
  RiLinkedinBoxFill,
  RiNextjsFill
} from "react-icons/ri";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { GiHedgehog } from "react-icons/gi";
import Logo from "../logo/Logo";
import { FaWordpress } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border border-[#adb5bd]/70 bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md mx-auto mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo />
          </div>

          {/* Main Links */}
          <ul className="flex flex-wrap items-center text-sm text-zinc-400 gap-4 sm:gap-6">
            <li>
              <Link href="/terms" className="hover:text-zinc-100 transition">
                Uvjeti korištenja
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-zinc-100 transition">
                Pravila privatnosti
              </Link>
            </li>
            <li>
              <Link href="/complaint" className="hover:text-zinc-100 transition">
                Prigovor & Reklamacije
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-zinc-100 transition">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>

        {/* SOCIAL ICONS */}
        <div className="flex flex-col items-center mt-12">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4">
            Budimo u kontaktu
          </h3>

          <div className="flex items-center gap-4 text-blue-600">
            <Link href="https://www.facebook.com/?locale=hr_HR" target="_blank" rel="noreferrer">
              <FiFacebook className="w-6 h-6 hover:scale-110 transition" />
            </Link>

            <Link
              href="https://business.facebook.com/latest/inbox/messenger?asset_id=137597493551735&business_id=1133499703746344"
              target="_blank" rel="noreferrer"
            >
              <RiMessengerLine className="w-6 h-6 hover:scale-110 transition" />
            </Link>

            <Link href="mailto:prodaja@zivic-elektro.com" target="_blank" rel="noreferrer">
              <MdOutlineAlternateEmail className="w-6 h-6 hover:scale-110 transition" />
            </Link>

            <Link href="https://www.linkedin.com/in/darko-%C5%BEivi%C4%87/" target="_blank" rel="noreferrer">
              <RiLinkedinBoxFill className="w-6 h-6 hover:scale-110 transition" />
            </Link>
          </div>
        </div>

        {/* POWERED BY */}
        <div className="flex items-center justify-center gap-3 mt-12 text-gray-500 text-sm">
          Powered by
          <Link href="https://nextjs.org/" target="_blank" rel="noreferrer">
            <RiNextjsFill className="w-6 h-6 hover:text-blue-400 transition" />
          </Link>
          &
          <Link href="https://wordpress.org/" target="_blank" rel="noreferrer">
            <FaWordpress className="w-6 h-6 hover:text-blue-400 transition" />
          </Link>
        </div>

        {/* DEVELOPED BY */}
        <div className="flex items-center justify-center gap-3 mt-4 text-gray-500 text-sm">
          Developed by Hedgehog
          <Link
            href="https://www.hedgehogwebdev.com"
            target="_blank"
            rel="noreferrer"
          >
            <GiHedgehog className="w-6 h-6 hover:scale-110 hover:text-blue-400 transition" />
          </Link>
        </div>

        <hr className="my-8 border-[#adb5bd]/70" />

        {/* COPYRIGHT */}
        <div className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Živić-Elektro. Sva prava zadržana.
        </div>

        {/* SITEMAP */}
        <div className="text-center mt-4">
          <Link
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-gray-300 transition text-sm"
          >
            sitemap.xml
          </Link>
        </div>
      </div>
    </footer>
  );
}