import { ExternalLink, Swords } from "lucide-react";

const FooterBar = () => {
  return (
    <footer className="shrink-0 flex items-center justify-between px-5 h-10 border-t border-border bg-background/80 backdrop-blur-sm z-10">

      {/* Left — branding */}
      <div className="flex items-center gap-2 text-muted-foreground/60">
        <Swords size={12} />
        <span className="text-xs">DN Overview</span>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <span className="text-xs">Dragon Nest SEA</span>
      </div>

      {/* Right — meta */}
      <div className="flex items-center gap-3 text-muted-foreground/50">
        <span className="text-xs">© 2023 sam</span>
        <a
          href="https://github.com/wayansam/dn-overview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:text-foreground hover:bg-accent"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </footer>
  );
};

export default FooterBar;
