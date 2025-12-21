import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { token } = authStore.state;

    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
