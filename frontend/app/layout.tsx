import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "The Dryness Eliminator™ 👻",
  description: "Your AI wingman for ghosting and dry chats. Spooky-playful SaaS that keeps conversations alive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen font-sans flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </body>
    </html>
  );
}
