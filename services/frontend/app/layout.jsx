import "./globals.css";
import Navbar from "./components/navbar";

export default function RootLayout({ children }) {
  return (
<html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          defer
        ></script>
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-3">
          © TER 2025
        </footer>
      </body>
    </html>
   )
 }