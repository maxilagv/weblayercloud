"use client";

import * as React from "react";
import { motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: { id: number; title: string; url: string }[];
}

interface NavBarProps {
  menus: NavItem[];
  className?: string;
}

const NavBar = ({ menus, className }: NavBarProps) => {
  const [activeDropdown, setActiveDropdown] = React.useState<number | null>(null);

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
      <nav className={cn("fixed top-0 left-0 right-0 z-50 flex justify-center p-4", className)}>
        <ul className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background/80 backdrop-blur-md shadow-sm">
          {menus.map((nav) => (
            <li
              key={nav.id}
              className="relative"
              onMouseEnter={() => nav.dropdown && setActiveDropdown(nav.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <motion.a
                href={nav.url}
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {nav.title}
              </motion.a>
              {nav.dropdown && activeDropdown === nav.id && nav.items && (
                <div className="absolute top-full left-0 mt-2 w-48 pt-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col overflow-hidden rounded-xl border bg-background shadow-lg"
                  >
                    {nav.items.map((item) => (
                      <motion.a
                        key={item.id}
                        href={item.url}
                        className="w-full px-4 py-3 text-sm transition-colors hover:bg-muted"
                      >
                        {item.title}
                      </motion.a>
                    ))}
                  </motion.div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </MotionConfig>
  );
};

export default NavBar;
