"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getInitials } from "@/lib/utils";
import { navItems } from "@/config/nav";
import { useUIStore } from "@/stores/ui-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Zap, PanelLeftClose, PanelLeft, type LucideIcon } from "lucide-react";

// Group nav items for visual separation
const mainNavItems = navItems.filter((item) =>
  ["/", "/applications", "/cold-emails", "/contacts", "/companies"].includes(item.href)
);
const toolsNavItems = navItems.filter((item) =>
  ["/resumes", "/eligibility", "/ai-chat", "/templates"].includes(item.href)
);
const trackNavItems = navItems.filter((item) =>
  ["/follow-ups", "/calendar"].includes(item.href)
);
const settingsNavItems = navItems.filter((item) =>
  ["/settings"].includes(item.href)
);

function NavSection({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: ReadonlyArray<{ title: string; href: string; icon: LucideIcon; description: string }>;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="mb-1">
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-1 px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60"
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
      {collapsed && <div className="my-2 mx-2 h-px bg-border/50" />}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-600 to-indigo-600"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );

          return (
            <li key={item.href}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger render={linkContent} />
                  <TooltipContent side="right" sideOffset={8}>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { data: session } = useSession();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar"
    >
      {/* Logo header */}
      <div className="flex h-14 items-center justify-between px-3">
        <Link href="/" className="flex items-center overflow-hidden h-9">
          {sidebarCollapsed ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
              <Image src="/logo-icon-light.png" alt="Nova Icon" width={32} height={32} className="object-contain block dark:hidden" />
              <Image src="/logo-icon-dark.png" alt="Nova Icon" width={32} height={32} className="object-contain hidden dark:block" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 130 }}
              exit={{ opacity: 0, width: 0 }}
              className="flex h-9 shrink-0 items-center overflow-hidden"
            >
              <Image src="/logo-full-light.png" alt="Nova Logo" width={130} height={36} className="object-contain object-left block dark:hidden" />
              <Image src="/logo-full-dark.png" alt="Nova Logo" width={130} height={36} className="object-contain object-left hidden dark:block" />
            </motion.div>
          )}
        </Link>
        {!sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleSidebarCollapse}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation — takes all available space */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
        <NavSection label="Main" items={mainNavItems} pathname={pathname} collapsed={sidebarCollapsed} />
        <NavSection label="Tools" items={toolsNavItems} pathname={pathname} collapsed={sidebarCollapsed} />
        <NavSection label="Tracking" items={trackNavItems} pathname={pathname} collapsed={sidebarCollapsed} />
        <NavSection label="System" items={settingsNavItems} pathname={pathname} collapsed={sidebarCollapsed} />
      </nav>

      {/* User profile footer */}
      <div className="border-t border-border p-2">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                {session?.user?.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={toggleSidebarCollapse}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                {session?.user?.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{session?.user?.name || "User"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{session?.user?.email || ""}</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
