{"shell to load server side"}
export const metadata = {
    title: "Dashboard",
    description: "Interface d'administration du site.",
  };
  
  import DashboardShell from "@/components/DashboardShell";
  
  export default function Layout({ children }) {
    return <DashboardShell>{children}</DashboardShell>;
  }
  