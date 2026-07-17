import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustRide - Secure Remote Vehicle Immobilization Platform",
  description: "Governed, safe, and accountable remote EV disabling system simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col cyber-grid bg-background text-foreground selection:bg-cyan-500/20 selection:text-cyan-400">
        {/* Top Warning Banner about Simulated Components */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-medium text-amber-300 tracking-wide">
          ⚠️ SIMULATION MODE: Hardware Security Modules (HSM) and Vehicle Secure Elements are fully simulated in software.
        </div>

        {/* Root Shell Wrapper */}
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground bg-card/20">
          <p>© 2026 TrustRide Security Framework. Under governance parameters. Safe motion interlock enabled.</p>
        </footer>
      </body>
    </html>
  );
}
