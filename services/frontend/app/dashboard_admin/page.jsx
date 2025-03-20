'use client';
import Card from "./components/Card";
import { FaUser } from "react-icons/fa6";
import { FiEye } from "react-icons/fi";
import { BsDatabaseCheck } from "react-icons/bs";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { TbApi } from "react-icons/tb";
import { IoWarningOutline } from "react-icons/io5";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  function handleClick() {
    router.push("/dashboard_admin/users");
  }

  return (
    <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Accueil</h1>
          <p className="text-gray-500">
            Lorem ipsum lorem lorem
          </p>
        </div>
      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <Card
          title="Utilisateurs"
          Icon={FaUser}
          description="Gestion des utilisateurs"
          badgeCount={5}
          onClick={handleClick}
        />
        <Card
          title="Visiteurs"
          Icon={FiEye}
          description="Monitoring du trafic"
          onClick={() => alert("Vers Visiteurs")}
        />
        <Card
          title="API's Monitoring"
          Icon={TbApi}
          description="Monitoring des APIs"
        />
        <Card
          title="System Monitoring"
          Icon={MdOutlineMonitorHeart}
          description="Contrôles des metrics système"
        />
        <Card
          title="Database Monitoring"
          Icon={BsDatabaseCheck}
          description="Contrôles des metrics DB"
        />
        <Card
          title="Alertes"
          Icon={IoWarningOutline}
          description="Gestion des alertes et notifications"
        />
      </div>
    </div>
  );
}
