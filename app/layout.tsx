import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SolarizedNG",
  description: "Empowering and uplifting lives 🌞",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
