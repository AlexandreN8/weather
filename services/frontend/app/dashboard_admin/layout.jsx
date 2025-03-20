'use client';
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import "../globals.css"; 

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <Sidebar isOpen= {isSidebarOpen}/>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <Navbar onToggleSidebar={toggleSidebar} isOpen={isSidebarOpen}  />

        {/* Content */}
        <main className="p-4 bg-[#F1F5FB] flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
