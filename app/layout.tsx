import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Озонація, сухий туман та демеркуризація в Києві | Знищення запахів — DryZone",
  description:
    "Професійна озонація, сухий туман та демеркуризація в Києві та області. Безпечно для дітей і тварин. Виїзд фахівця. Ефективне знищення будь-яких запахів.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`
            (function () {
              if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
              var PREFIX = 'bis_';
              var stripFromElement = function (el) {
                if (!el || el.nodeType !== 1 || !el.attributes) return;
                for (var i = el.attributes.length - 1; i >= 0; i--) {
                  var name = el.attributes[i].name;
                  if (name.indexOf(PREFIX) === 0) el.removeAttribute(name);
                }
              };
              var stripFromTree = function (root) {
                stripFromElement(root);
                if (root && root.querySelectorAll) {
                  var nodes = root.querySelectorAll('*');
                  for (var i = 0; i < nodes.length; i++) stripFromElement(nodes[i]);
                }
              };
              try {
                new MutationObserver(function (mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf(PREFIX) === 0) {
                      m.target.removeAttribute(m.attributeName);
                    } else if (m.type === 'childList') {
                      for (var j = 0; j < m.addedNodes.length; j++) stripFromTree(m.addedNodes[j]);
                    }
                  }
                }).observe(document.documentElement, { attributes: true, childList: true, subtree: true });
              } catch (e) {}
              if (document.readyState !== 'loading') {
                stripFromTree(document.documentElement);
              } else {
                document.addEventListener('DOMContentLoaded', function () {
                  stripFromTree(document.documentElement);
                });
              }
            })();
          `}
        </Script>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NTJK6L4W');
          `}
        </Script>
        <Script id="json-ld-local-business" type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "DryZone",
              "telephone": "063 346 9005",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Київ",
                "addressCountry": "UA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 50.398966,
                "longitude": 30.365554
              },
              "url": "https://www.dryzone.solutions",
              "hasMap": "https://maps.app.goo.gl/rfZVjPz4r266pPk76"
            }
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NTJK6L4W"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
