import { useState } from "react";
import { Menu, X, BarChart3, Home, TrendingUp, Layers, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Saham Populer", icon: Zap, href: "/#stocks" },
  { label: "Top Movers", icon: TrendingUp, href: "/#movers" },
  { label: "Peta Pasar", icon: Layers, href: "/#heatmap" },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground transition-colors hover:bg-accent"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] border-l border-border bg-card shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                    <BarChart3 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-extrabold gradient-text">IDX Saham</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                <SearchBar />
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.href);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center">
                  © 2026 IDX Saham
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;
