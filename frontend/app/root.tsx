import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import type { Route } from "./+types/root";
import { queryClient } from "./lib/queryClient";
import { initTheme } from "./lib/theme";
import { registerServiceWorker } from "./lib/sw";
import { Toaster } from "./components/ui/Toaster";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function meta() {
  return [
    { title: "Niat — Journal, fokus, dan kebiasaan untuk hidup lebih baik" },
    {
      name: "description",
      content:
        "Niat — aplikasi produktivitas pribadi untuk journal pagi & malam, focus timer, habits, task, dan menangkap ide. Mulai hari dengan niat, akhiri dengan refleksi.",
    },
    { property: "og:title", content: "Niat — Journal, fokus, dan kebiasaan untuk hidup lebih baik" },
    {
      property: "og:description",
      content:
        "Mulai hari dengan niat, akhiri dengan refleksi. Journal, focus timer, habits, dan task dalam satu aplikasi.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://my.aryadwip.com/" },
    { property: "og:image", content: "https://my.aryadwip.com/icon.svg" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Niat — Journal, fokus, dan kebiasaan untuk hidup lebih baik" },
    {
      name: "twitter:description",
      content: "Mulai hari dengan niat, akhiri dengan refleksi. Journal, fokus, dan kebiasaan.",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
    registerServiceWorker();
  }, []);
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
