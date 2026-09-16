import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { getSiteUrl } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DILA Diseño Latino | Fajas moldeadoras de uso diario",
    template: "%s | DILA Diseño Latino",
  },
  description:
    "Short moldeador de alta compresión sin costuras. Reduce tallas al instante y se siente cómodo todo el día. Hecho en Colombia.",
  openGraph: {
    title: "DILA Diseño Latino | Fajas moldeadoras de uso diario",
    description:
      "Short moldeador de alta compresión sin costuras. Reduce tallas al instante y se siente cómodo todo el día.",
    url: siteUrl,
    siteName: "DILA Diseño Latino",
    images: [{ url: "/images/faja-frente.webp", width: 1080, height: 1350 }],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DILA Diseño Latino | Fajas moldeadoras de uso diario",
    description:
      "Short moldeador de alta compresión sin costuras. Reduce tallas al instante y se siente cómodo todo el día.",
    images: ["/logo-white.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        <div className="site-wrapper">
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
      </body>
    </html>
  );
}
