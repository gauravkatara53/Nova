"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { navItems } from "@/config/nav";
import {
  Plus,
  Mail,
  User,
  Building2,
  FileText,
  Sparkles,
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/cold-emails?new=true"))}
          >
            <Mail className="mr-2 h-4 w-4" />
            New Cold Email
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/contacts?new=true"))}
          >
            <User className="mr-2 h-4 w-4" />
            New Contact
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/applications?new=true"))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/companies?new=true"))}
          >
            <Building2 className="mr-2 h-4 w-4" />
            New Company
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/resumes?new=true"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            Upload Resume
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ai-chat"))}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
              <span className="ml-2 text-xs text-muted-foreground">
                {item.description}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
