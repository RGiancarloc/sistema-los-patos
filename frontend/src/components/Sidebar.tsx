import { 
  LogOut, 
  ShoppingBag, 
  Utensils, 
  Users, 
  ShoppingCart, 
  Flame, 
  BarChart3, 
  History,
  Compass,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Boxes,
  Sun,
  Moon,
  Globe
} from "lucide-react";
import type { Usuario } from "../api";
import { useTranslation } from "../LanguageContext";

interface SidebarProps {
  usuario: Usuario;
  vistaActual: string;
  setVistaActual: (vista: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  usuario,
  vistaActual,
  setVistaActual,
  onLogout,
  collapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
}) => {
  const isAdmin = usuario.rolSistema === "administrador";
  const { t, language, setLanguage } = useTranslation();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard": return <LayoutDashboard size={18} />;
      case "catalogo": return <ShoppingBag size={18} />;
      case "insumos": return <Boxes size={18} />;
      case "mesas": return <Utensils size={18} />;
      case "clientes": return <Users size={18} />;
      case "ventas": return <ShoppingCart size={18} />;
      case "cocina": return <Flame size={18} />;
      case "analitica": return <BarChart3 size={18} />;
      case "historial": return <History size={18} />;
      case "predicts": return <TrendingUp size={18} />;
      default: return <Compass size={18} />;
    }
  };

  const navItem = (id: string, label: string, icon: string) => {
    const active = vistaActual === id;
    return (
      <button
        key={id}
        onClick={() => setVistaActual(id)}
        className={`sidebar-nav-btn ${active ? "active" : ""}`}
      >
        {renderIcon(icon)}
        <span>{t(label)}</span>
      </button>
    );
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header" style={{ flexDirection: collapsed ? "column" : "row", gap: collapsed ? "10px" : "12px" }}>
        <img src="/img/log.jpg" alt="Logo" className="logo-badge" />
        {!collapsed && <h2>Los Patos</h2>}
        <button 
          onClick={onToggleCollapse} 
          className="collapse-toggle-btn" 
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          style={{ marginLeft: collapsed ? "0" : "auto" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {(usuario.nombre || "US").substring(0, 2).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{usuario.nombre || "Usuario"}</span>
          <span className="user-role">{(usuario.rolSistema || "empleado").toUpperCase()}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">{t("OPERACIÓN")}</div>
        {navItem("dashboard", "Dashboard", "dashboard")}
        {navItem("ventas", "Ventas (POS)", "ventas")}
        {navItem("cocina", "Cocina Monitor", "cocina")}
        {navItem("mesas", "Gestión Mesas", "mesas")}
        {navItem("clientes", "Gestión Clientes", "clientes")}

        {isAdmin && (
          <>
            <div className="nav-group-label">{t("ADMINISTRACIÓN")}</div>
            {navItem("catalogo", "Catálogo Prod.", "catalogo")}
            {navItem("insumos", "Gestión Insumos", "insumos")}
            
            <div className="nav-group-label">{t("BI & ANALÍTICA")}</div>
            {navItem("analitica", "KPI Dashboards", "analitica")}
            {navItem("historial", "Historial Ventas", "historial")}
            {navItem("predicts", "Predicciones Ventas", "predicts")}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="lang-toggle-btn" onClick={() => setLanguage(language === "es" ? "en" : "es")} title={language === "es" ? t("English Mode") : t("Modo Español")}>
          <Globe size={16} />
          <span>{language === "es" ? t("English Mode") : t("Modo Español")}</span>
        </button>
        <button className="theme-toggle-btn" onClick={onToggleTheme} title={theme === "light" ? t("Modo Oscuro") : t("Modo Claro")}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === "light" ? t("Modo Oscuro") : t("Modo Claro")}</span>
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>{t("Cerrar Sesión")}</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--card-border);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          z-index: 100;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collapse-toggle-btn {
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: var(--text-muted);
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .collapse-toggle-btn:hover {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--card-border);
        }

        .logo-badge {
          height: 32px;
          width: 32px;
          object-fit: contain;
          border-radius: 6px;
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-highlight) 0%, var(--accent-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid var(--card-border);
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          background: var(--accent-primary);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-highlight);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .user-role {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-primary);
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-group-label {
          font-size: 0.675rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-top: 16px;
          margin-bottom: 6px;
          padding-left: 10px;
        }

        .sidebar-nav-btn {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          font-size: 0.9rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .sidebar-nav-btn:hover {
          background: var(--bg-primary);
          color: var(--text-highlight);
        }

        .sidebar-nav-btn.active {
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          border-left: 3px solid var(--accent-primary);
          padding-left: 11px; /* Compensate for border */
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--card-border);
        }

        .theme-toggle-btn {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--card-border);
          color: var(--text-main);
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-highlight);
          border-color: var(--accent-primary);
        }

        .lang-toggle-btn {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--card-border);
          color: var(--text-main);
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .lang-toggle-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-highlight);
          border-color: var(--accent-primary);
        }

        .layout-container.sidebar-collapsed .lang-toggle-btn {
          justify-content: center;
          padding: 12px;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          margin: 0 auto 8px auto;
        }

        .layout-container.sidebar-collapsed .theme-toggle-btn {
          justify-content: center;
          padding: 12px;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          margin: 0 auto 8px auto;
        }

        .logout-btn {
          width: 100%;
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.12);
          color: var(--accent-danger);
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: var(--accent-danger);
          color: white;
          border-color: var(--accent-danger);
        }
      `}</style>
    </aside>
  );
};
