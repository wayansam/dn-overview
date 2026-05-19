import {
  Gem,
  Home,
  LayoutGrid,
  Map,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { LS_KEYS } from "../constants/localStorage.constants";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setIsDarkMode } from "../slice/UIState.reducer";

const GROUP_ICONS: Record<string, React.ElementType> = {
  MAIN: Home,
  STAGE: Map,
  EQUIPMENT: Shield,
  JADE: Gem,
  HERALDRY: Star,
  TALISMAN: Sparkles,
  MISC: LayoutGrid,
  UTILITY: Settings,
};

const TopBar = () => {
  const dispatch = useAppDispatch();
  const selectedSideBar = useAppSelector((state) => state.UIState.selectedSideBar);
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  const parentGroup = TAB_GROUP_LIST.find((g) =>
    g.children.some((c) => c.key === selectedSideBar.key)
  );

  const GroupIcon = parentGroup ? (GROUP_ICONS[parentGroup.key] ?? LayoutGrid) : null;

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    dispatch(setIsDarkMode(next));
    localStorage.setItem(LS_KEYS.dark_mode, JSON.stringify(next));
  };

  return (
    <header className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm z-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 min-w-0">
        {parentGroup && GroupIcon && (
          <>
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <GroupIcon size={14} />
              <span className="text-sm">{parentGroup.name}</span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-muted-foreground/40 shrink-0"
            >
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
        <span className="text-sm font-semibold text-foreground truncate">
          {selectedSideBar.name}
        </span>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 cursor-pointer",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
