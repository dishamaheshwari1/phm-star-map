import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Local Stellar Map" },
      { name: "description", content: "Follow along with Grace's adventure to save the stars and explore our local stellar neighborhood along the way! Inspired by the movie Project Hail Mary." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Local Stellar Map" },
      { property: "og:description", content: "Follow along with Grace's adventure to save the stars and explore our local stellar neighborhood along the way! Inspired by the movie Project Hail Mary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Local Stellar Map" },
      { name: "twitter:description", content: "Follow along with Grace's adventure to save the stars and explore our local stellar neighborhood along the way! Inspired by the movie Project Hail Mary." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c539fc9b-59cb-451f-8801-7ec2c27e341e/id-preview-9845968f--8a95b807-1c7a-4d8c-bc56-55cd76bc208a.lovable.app-1776899069915.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c539fc9b-59cb-451f-8801-7ec2c27e341e/id-preview-9845968f--8a95b807-1c7a-4d8c-bc56-55cd76bc208a.lovable.app-1776899069915.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
