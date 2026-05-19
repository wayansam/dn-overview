import { Grid, Layout } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Gem,
  Home,
  LayoutGrid,
  Map,
  Settings,
  Shield,
  Sparkles,
  Star,
  Swords,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LS_KEYS } from "../constants/localStorage.constants";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { SideBarTab } from "../interface/Common.interface.tsx";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  setIsCollapsedSideBar,
  setSelectedSideBar,
} from "../slice/UIState.reducer";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

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

const ICON_RAIL_WIDTH = 56;

const SideBar = () => {
  const dispatch = useAppDispatch();
  const screens = useBreakpoint();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );
  const isCollapsedSideBar = useAppSelector(
    (state) => state.UIState.isCollapsedSideBar
  );

  const [isSmall, setIsSmall] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsed = isSmall ? isCollapsedSideBar : isDesktopCollapsed;
  const collapsedWidth = isSmall ? 0 : ICON_RAIL_WIDTH;
  const isIconRail = isDesktopCollapsed && !isSmall;

  const openFlyout = (key: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setHoveredGroup(key);
  };

  const closeFlyout = () => {
    closeTimerRef.current = setTimeout(() => setHoveredGroup(null), 150);
  };

  const handleNavItemClick = (item: SideBarTab) => {
    dispatch(setSelectedSideBar(item));
    localStorage.setItem(LS_KEYS.last_screen, JSON.stringify(item));
    if (isSmall) dispatch(setIsCollapsedSideBar(true));
    setHoveredGroup(null);
  };

  return (
    <Sider
      breakpoint="md"
      collapsedWidth={collapsedWidth}
      onBreakpoint={(broken) => setIsSmall(broken)}
      onCollapse={(newCollapsed, type) => {
        if (type === "clickTrigger" || type === "responsive") {
          dispatch(setIsCollapsedSideBar(newCollapsed));
        }
      }}
      collapsed={collapsed}
      width={screens.xs ? 216 : 240}
      tabIndex={0}
      onBlur={() => isSmall && dispatch(setIsCollapsedSideBar(true))}
      onFocus={() => isSmall && dispatch(setIsCollapsedSideBar(false))}
      style={{
        background: "var(--sidebar)",
        overflow: isIconRail ? "visible" : undefined,
        ...(isSmall
          ? { position: "fixed", zIndex: 100, height: "100%" }
          : undefined),
      }}
    >
      <div
        className={cn(
          "flex flex-col h-full border-r border-sidebar-border",
          isIconRail ? "overflow-visible" : "overflow-hidden"
        )}
      >
        {/* ── Brand ── */}
        <div
          className={cn(
            "shrink-0 border-b border-sidebar-border",
            isIconRail
              ? "flex flex-col items-center py-3 gap-1.5"
              : "flex items-center gap-2.5 px-4 py-[14px]"
          )}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
            <Swords size={14} className="text-primary" />
          </div>
          {!isIconRail && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground leading-none">
                DN Overview
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-none">
                Dragon Nest SEA
              </p>
            </div>
          )}
          {!isSmall && (
            <button
              onClick={() => setIsDesktopCollapsed((v) => !v)}
              className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0"
              title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isDesktopCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav
          className={cn(
            "flex-1 py-3",
            isIconRail
              ? "overflow-visible px-1.5 space-y-1"
              : "overflow-y-auto px-2 space-y-3"
          )}
        >
          {TAB_GROUP_LIST.map((group) => {
            const GroupIcon = GROUP_ICONS[group.key] ?? LayoutGrid;
            const isGroupActive = group.children.some(
              (c) => c.key === selectedSideBar.key
            );

            if (isIconRail) {
              const isFlyoutOpen = hoveredGroup === group.key;
              return (
                <div
                  key={group.key}
                  className="relative"
                  onMouseEnter={() => openFlyout(group.key)}
                  onMouseLeave={closeFlyout}
                >
                  {/* Group icon button */}
                  <button
                    className={cn(
                      "w-full flex items-center justify-center h-9 rounded-md transition-colors duration-100",
                      isGroupActive || isFlyoutOpen
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                    title={group.name}
                  >
                    <GroupIcon size={16} />
                  </button>

                  {/* Flyout submenu */}
                  {isFlyoutOpen && (
                    <div
                      className="absolute left-full top-0 z-[200]"
                      onMouseEnter={() => openFlyout(group.key)}
                      onMouseLeave={closeFlyout}
                    >
                      <div className="ml-1.5 bg-sidebar border border-sidebar-border rounded-lg shadow-xl p-2 min-w-[180px]">
                        <div className="flex items-center gap-1.5 px-1 mb-1.5 select-none">
                          <GroupIcon
                            size={10}
                            className="text-muted-foreground/50"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">
                            {group.name}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {group.children.map((item) => {
                            const isActive = selectedSideBar.key === item.key;
                            return (
                              <button
                                key={item.key}
                                onClick={() => handleNavItemClick(item)}
                                className={cn(
                                  "w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-md",
                                  "text-sm leading-snug transition-colors duration-100 cursor-pointer",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                )}
                              >
                                <span
                                  className={cn(
                                    "shrink-0 w-0.5 h-3.5 rounded-full",
                                    isActive ? "bg-primary" : "bg-transparent"
                                  )}
                                />
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── Expanded mode ──
            return (
              <div key={group.key}>
                <div className="flex items-center gap-1.5 px-2 mb-1 select-none">
                  <GroupIcon
                    size={10}
                    className="text-muted-foreground/50 shrink-0"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">
                    {group.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.children.map((item) => {
                    const isActive = selectedSideBar.key === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleNavItemClick(item)}
                        className={cn(
                          "w-full flex items-start gap-2 text-left py-1.5 px-2 rounded-md",
                          "text-sm leading-snug transition-colors duration-100 cursor-pointer",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-[3px] shrink-0 w-0.5 h-3.5 rounded-full transition-all duration-150",
                            isActive ? "bg-primary" : "bg-transparent"
                          )}
                        />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        {!isIconRail && (
          <div className="shrink-0 border-t border-sidebar-border px-4 py-2.5">
            <p className="text-[10px] text-muted-foreground/40 text-center select-none">
              DN Overview © 2023 · sam
            </p>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default SideBar;
