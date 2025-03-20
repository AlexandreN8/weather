'use client';
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-6">
        <Link href="/" className="hover:underline">Accueil</Link>
        <Link href="/map" className="hover:underline">Carte</Link>
        <Link href="/forecast" className="hover:underline">Prévisions</Link>
        <Link href="/dashboard_admin" className="hover:underline">Admin</Link>
      </div>
    </nav>
  );
}
