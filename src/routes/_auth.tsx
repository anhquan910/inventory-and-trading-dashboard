import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authStore } from "@/stores/auth"; // Adjust path to your store

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
