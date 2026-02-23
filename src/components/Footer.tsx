import { BarChart3, Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  const now = new Date();
  const updateTime = now.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="border-t border-border mt-12 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                <BarChart3 className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-sm font-extrabold gradient-text">IDX Saham</span>
                <p className="text-[10px] text-muted-foreground">Indonesia Stock Analysis</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Platform analisis saham Indonesia yang menyediakan data real-time, analisis teknikal, dan perbandingan fundamental.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sumber Data</h4>
            <div className="space-y-2">
              {[
                { label: "Yahoo Finance", url: "https://finance.yahoo.com" },
                { label: "IDX (Bursa Efek Indonesia)", url: "https://idx.co.id" },
                { label: "OJK", url: "https://ojk.go.id" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Disclaimer</h4>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Data yang ditampilkan bersifat simulasi untuk keperluan edukasi. Bukan merupakan rekomendasi investasi. Selalu lakukan riset mandiri sebelum berinvestasi.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <div className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
              Data diperbarui: {updateTime} WIB
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground/40">© {now.getFullYear()} IDX Saham. Semua hak dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
