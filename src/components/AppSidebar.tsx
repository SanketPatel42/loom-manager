
import { LayoutDashboard, Wind, Package, Users, ShoppingCart, Package2, Building2, Archive, UserCog, Award, Wrench, Calculator, DollarSign, UserPlus, Settings, StickyNote } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { asyncStorage } from "@/lib/storage";
import { onDataChange } from "@/lib/events";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";



interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: React.ReactNode;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [reminderStatus, setReminderStatus] = useState<'none' | 'active' | 'due'>('none');

  const isActive = (path: string) => path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const checkReminders = async () => {
    try {
      const notes = await asyncStorage.getNotes();
      const activeReminders = notes.filter(n => n.isReminder && !n.completed);

      if (activeReminders.length === 0) {
        setReminderStatus('none');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isDueTodayOrPast = activeReminders.some(n => {
        if (!n.reminderDate) return false;
        const reminderDate = new Date(n.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate.getTime() <= today.getTime();
      });

      if (isDueTodayOrPast) {
        setReminderStatus('due');
      } else {
        setReminderStatus('active');
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  };

  useEffect(() => {
    checkReminders();
    const unsubscribe = onDataChange((e) => {
      if (e.detail.entity === 'notes') {
        checkReminders();
      }
    });
    // Also check periodically in case date changes while open
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const groups: MenuGroup[] = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        {
          title: "Notes & Reminders",
          url: "/notes",
          icon: StickyNote,
          badge: reminderStatus !== 'none' ? (
            <div
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${reminderStatus === 'due' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                }`}
            />
          ) : undefined
        },
      ],
    },
    {
      label: "Production",
      items: [
        { title: "Beams", url: "/beams", icon: Wind },
        { title: "Beam Pasar", url: "/beam-pasar", icon: Wrench },
        { title: "Takas", url: "/takas", icon: Package },
        { title: "Qualities", url: "/qualities", icon: Award },
        { title: "Stock", url: "/stock", icon: Archive },
        { title: "Textile Calculations", url: "/textile-calculations", icon: Calculator },
      ],
    },
    {
      label: "HR & Payroll",
      items: [
        { title: "Workers", url: "/workers", icon: Users },
        { title: "Worker Profiles", url: "/worker-profiles", icon: UserCog },
        { title: "Additional Workers", url: "/additional-workers", icon: UserPlus },
        { title: "Salary Calculator", url: "/salary-calculator", icon: Calculator },
        { title: "Comprehensive Salary", url: "/comprehensive-salary", icon: DollarSign },
      ],
    },
    {
      label: "Finance",
      items: [
        { title: "Purchases", url: "/purchases", icon: Package2 },
        { title: "Sales", url: "/sales", icon: ShoppingCart },
        { title: "Transactions", url: "/transactions", icon: Building2 },
      ],
    },
    {
      label: "System",
      items: [
        { title: "Settings", url: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="relative pr-8">
                      <NavLink to={item.url} end={item.url === "/"}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
