"use client";

import * as React from "react";
import {
  AudioWaveform,
  ChefHat,
  Command,
  GalleryVerticalEnd,
  Hamburger,
  LayoutDashboard,
  Logs,
  User,
  UtensilsCrossed,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "DeliGo",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "User",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "User Lists",
          url: "user-list",
        },
        {
          title: "User Owner Requests",
          url: "user-owner-requests",
        },
      ],
    },
    {
      title: "Restaurant",
      url: "#",
      icon: UtensilsCrossed,
      isActive: true,
      items: [
        {
          title: "Restaurant Lists",
          url: "restaurant-list",
        },
        {
          title: "Restaurant Create Request",
          url: "restaurant-create-request",
        },
        {
          title: "Restaurant Update Request",
          url: "restaurant-update-request",
        },
      ],
    },
    {
      title: "Food",
      url: "#",
      icon: Hamburger,
      isActive: true,
      items: [
        {
          title: "Food Lists",
          url: "food-list",
        },
        {
          title: "Food Create",
          url: "#",
        },
      ],
    },
    {
      title: "Category",
      url: "#",
      icon: Logs,
      isActive: true,
      items: [
        {
          title: "Category Lists",
          url: "category-list",
        },
        {
          title: "Category Create",
          url: "#",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: ChefHat,
      items: [
        {
          title: "Order Lists",
          url: "order-list",
        },
        {
          title: "Order Create",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
