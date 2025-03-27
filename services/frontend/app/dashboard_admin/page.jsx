'use client';
import Card from "./components/Card";
import { FaUser } from "react-icons/fa6";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { BsDatabaseCheck } from "react-icons/bs";
import { MdOutlineMonitorHeart, MdOutlineSettingsInputAntenna } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#191919]">Accueil</h1>
        <p className="text-gray-500">
          Lorem ipsum lorem lorem
        </p>
      </div>
      {/* Responsive grid for categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <Card
          title="Utilisateurs"
          Icon={FaUser}
          description="Gestion des utilisateurs"
          badgeCount={5}
          onClick={() => router.push("/dashboard_admin/users")}
        />
        <Card
          title="Visiteurs"
          Icon={LuChartNoAxesCombined}
          description="Monitoring du trafic"
          onClick={() => router.push("/dashboard_admin/visitors")}
        />
        <Card
          title="API's Monitoring"
          Icon={MdOutlineSettingsInputAntenna}
          description="Monitoring des APIs"
          onClick={() => router.push("/dashboard_admin/apis")}
        />
        <Card
          title="System Monitoring"
          Icon={MdOutlineMonitorHeart}
          description="Contrôles des metrics système"
          onClick={() => router.push("/dashboard_admin/system")}
        />
        <Card
          title="Database Monitoring"
          Icon={BsDatabaseCheck}
          description="Contrôles des metrics DB"
          onClick={() => router.push("/dashboard_admin/database")}
        />
        <Card
          title="Alertes"
          Icon={IoWarningOutline}
          description="Gestion des alertes et notifications"
          onClick={() => router.push("/dashboard_admin/alerts")}
        />
      </div>
    </div>
  );
}
