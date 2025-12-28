import * as React from "react";
import {
  ArrowRightLeft,
  BarChart3,
  Box,
  Frame,
  Gem,
  Hammer,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/stores/auth";

const data = {
  teams: [
    {
      name: "Jewellery Store",
      logo: Gem,
      plan: "Main Branch",
    },
    {
      name: "Workshop",
      logo: Hammer,
      plan: "Manufacturing",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "Gold Prices",
          url: "/market",
        },
      ],
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Box,
      items: [
        {
          title: "Materials (MIS)",
          url: "/inventory/materials",
        },
        {
          title: "Finished Goods (FGIS)",
          url: "/inventory/products",
        },
        {
          title: "Stocktake Audit",
          url: "/inventory/audit",
        },
      ],
    },
    {
      title: "Trading Desk",
      url: "/trade",
      icon: ArrowRightLeft,
      items: [
        {
          title: "Buy / Sell Gold",
          url: "/trade",
        },
        {
          title: "Transaction Ledger",
          url: "/trade/history",
        },
      ],
    },
    {
      title: "Production",
      url: "/production",
      icon: Hammer,
      items: [
        {
          title: "Active Jobs",
          url: "/production/jobs",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Financial Reports",
      url: "/reports",
      icon: BarChart3,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authState = useStore(authStore, (state) => state);

  const user = authState.user || {
    name: "User",
    email: "user@example.com",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "Admin", email: user.email, avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
