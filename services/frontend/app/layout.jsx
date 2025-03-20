import "./globals.css";
import NavbarFooterWrapper from "./components/NavbarFooterWrapper";

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
        <NavbarFooterWrapper>
          <main className="flex-1 flex items-center justify-center">
            {children}
          </main>
        </NavbarFooterWrapper>
      </body>
    </html>
  );
}
