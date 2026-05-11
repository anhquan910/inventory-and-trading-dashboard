import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authStore } from "@/stores/auth"; // Adjust path to your store

// Authentication layout that redirects logged-in users away from auth pages
export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const { token } = authStore.state;

    if (token) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
