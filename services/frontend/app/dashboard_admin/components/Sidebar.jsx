import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx"; 

import { FaHouse, FaUser } from "react-icons/fa6";
import { BsDatabaseCheck } from "react-icons/bs";
import { MdOutlineMonitorHeart, MdOutlineSettingsInputAntenna, MdHome } from "react-icons/md";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { IoMdSettings } from "react-icons/io";
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";

// Menus
const mainMenu = [
  { href: "/dashboard_admin", label: "Accueil", Icon: MdHome },
  { href: "/dashboard_admin/users", label: "Utilisateurs", Icon: FaUser },
  { href: "/dashboard_admin/database", label: "Base de données", Icon: BsDatabaseCheck },
  { href: "/dashboard_admin/system", label: "Système", Icon: MdOutlineMonitorHeart },
  { href: "/dashboard_admin/apis", label: "APIs", Icon: MdOutlineSettingsInputAntenna },
  { href: "/dashboard_admin/visitors", label: "Visiteurs", Icon: LuChartNoAxesCombined },
  { href: "/dashboard_admin/alerts", label: "Alertes", Icon: IoWarningOutline },
];

const preferencesMenu = [
  { href: "/dashboard/settings", label: "Paramètres", Icon: IoMdSettings },
  { href: "/dashboard/Deconnexion", label: "Déconnexion", Icon: RiLogoutBoxLine },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const isActive = (href) => pathname === href;

  return (
    <aside
      className={clsx(
        "bg-[#18202E] h-screen flex flex-col transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={clsx("flex items-center h-[65px] px-4", isOpen ? "justify-start px-4" : "justify-center px-0")}>
      <Image
          src="/images/logo.png"
          alt="Logo"
          width={50}
          height={50}
          className={clsx("transition-all")}
        />
        <h1 className={clsx("text-xl font-bold text-white transition-opacity", isOpen ? "opacity-100 visible" : "opacity-0 hidden")}>
          Name
        </h1>
      </div>

      {/* Menu */}
      <div className="mt-[65px] px-2 flex-1 flex flex-col">
        <h2 className={clsx("text-[#657EC9] uppercase text-xs tracking-wider transition-all", isOpen ? "visible" : "hidden")}>
          Menu principal
        </h2>

        {/* Main btns */}
        <ul className="mt-[20px] space-y-2">
          {mainMenu.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center h-[40px] rounded-md text-md px-4 cursor-pointer transition-all duration-300",
                  isActive(href) ? "bg-[#4785DD] text-white font-semibold" : "text-[#B3B8B4] hover:bg-[#364356] font-semibold",
                  isOpen ? "justify-start" : "justify-center"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className={clsx("ml-2 transition-opacity", isOpen ? "opacity-100" : "opacity-0 hidden")}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Preferences */}
        <div className="mt-auto mb-[30px]">
          <h2 className={clsx("text-[#657EC9] uppercase text-xs tracking-wider transition-all", isOpen ? "visible" : "hidden")}>
            Préférences
          </h2>
          <ul className="mt-[20px] space-y-2">
            {preferencesMenu.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "flex items-center h-[40px] rounded-md text-md px-4 cursor-pointer transition-all duration-300",
                    isActive(href) ? "bg-[#4785DD] text-white font-semibold" : "text-[#B3B8B4] hover:bg-[#364356] font-semibold",
                    isOpen ? "justify-start" : "justify-center"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className={clsx("ml-2 transition-opacity", isOpen ? "opacity-100" : "opacity-0 hidden")}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
