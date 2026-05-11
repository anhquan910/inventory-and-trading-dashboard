import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

// Root application layout with router devtools and toast notifications
const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
    <Toaster />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
