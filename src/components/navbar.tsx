"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Icons } from "./icons";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  className?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

const NavItem = ({ href, icon: Icon, label, onClick, className, tooltipSide = "top" }: NavItemProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          className
        )}
      >
        <Icon className="size-4" />
      </Link>
    </TooltipTrigger>
    <TooltipContent side={tooltipSide}>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

const ThemeToggle = ({ tooltipSide = "top" }: { tooltipSide?: "top" | "bottom" | "left" | "right" }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex justify-center">
        <ModeToggle />
      </div>
    </TooltipTrigger>
    <TooltipContent side={tooltipSide}>
      <p>Theme</p>
    </TooltipContent>
  </Tooltip>
);

// Generic render function to eliminate repetition
const renderItems = (
  items: ReadonlyArray<{ readonly href: string; readonly icon: any; readonly label: string }>,
  size: string,
  tooltipSide?: "top" | "bottom" | "left" | "right",
  onClick?: () => void,
  withDockIcon = false
) => {
  const itemsJSX = items.map((item) => (
    <NavItem
      key={item.href}
      href={item.href}
      icon={item.icon}
      label={item.label}
      className={size}
      tooltipSide={tooltipSide}
      onClick={onClick}
    />
  ));

  if (withDockIcon) {
    return items.map((item) => (
      <DockIcon key={item.href}>
        <NavItem
          href={item.href}
          icon={item.icon}
          label={item.label}
          className={size}
          tooltipSide={tooltipSide}
          onClick={onClick}
        />
      </DockIcon>
    ));
  }

  return itemsJSX;
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Memoize navigation items to prevent recreation on each render
  const navItems = useMemo(() => DATA.navbar || [], []);
  
  const additionalNavItems = useMemo(() => [
    { href: "/#projects", icon: Icons.projects, label: "Projects" },
    { href: "/#hackathons", icon: Icons.trophy, label: "Hackathons" },
  ], []);

  const socialNavItems = useMemo(() => 
    Object.entries(DATA.contact.social)
      .filter(([_, social]) => social.navbar)
      .map(([name, social]) => ({
        href: social.url,
        icon: social.icon,
        label: name,
      })), []
  );

  // Create a combined array for mobile menu to eliminate repetition
  const allMobileMenuItems = useMemo(() => [
    ...navItems,
    { type: 'separator' as const },
    ...additionalNavItems,
    { type: 'separator' as const },
    ...socialNavItems,
    { type: 'separator' as const },
    { type: 'theme' as const }
  ], [navItems, additionalNavItems, socialNavItems]);

  return (
    <>
      {/* Desktop Navbar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 hidden sm:flex origin-bottom h-full max-h-14">
        <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
        <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
          {renderItems(navItems, "size-12", "top", undefined, true)}
          <Separator orientation="vertical" className="h-full" />
          {renderItems(additionalNavItems, "size-12", "top", undefined, true)}
          <Separator orientation="vertical" className="h-full" />
          {renderItems(socialNavItems, "size-12", "top", undefined, true)}
          <Separator orientation="vertical" className="h-full py-2" />
          <DockIcon>
            <ThemeToggle />
          </DockIcon>
        </Dock>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/20 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Container */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "size-12 me-2 mb-2 rounded-full shadow-lg bg-background border border-border hover:bg-accent text-foreground"
          )}
        >
          {isMobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>

        {/* Mobile Vertical Menu */}
        <div
          className={cn(
            "absolute bottom-16 right-0 transition-all duration-300 transform origin-bottom-right",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95 pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center gap-2 p-3 bg-background border border-border rounded-2xl shadow-lg backdrop-blur-lg [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]">
            {allMobileMenuItems.map((item, index) => {
              if ('type' in item) {
                if (item.type === 'separator') {
                  return <Separator key={`separator-${index}`} className="w-full" />;
                }
                if (item.type === 'theme') {
                  return <ThemeToggle key="theme-toggle" tooltipSide="left" />;
                }
                return null;
              }
              
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  className="size-10"
                  tooltipSide="left"
                  onClick={toggleMobileMenu}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}