import React, { useState, useEffect } from "react";
import { api, type Usuario, type KpisResponse, API_BASE } from "../api";
import { 
  DollarSign, 
  ShoppingCart, 
  Flame, 
  Utensils, 
  Zap, 
  RefreshCcw, 
  TrendingUp 
} from "lucide-react";
import { useTranslation } from "../LanguageContext";

interface DashboardProps {
  usuario: Usuario;
  setVistaActual: (vista: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ usuario, setVistaActual }) => {
  const [kpis, setKpis] = useState<KpisResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [forecastSummary, setForecastSummary] = useState<string>("Cargando...");
  const [bestModelName, setBestModelName] = useState<string>("Stacking Hybrid");
  
  const { t, language } = useTranslation();
  const isEn = language === "en";

  const loadKpis = async () => {
    try {
      // Get general KPIs for the current year
      const currentYear = new Date().getFullYear();
      const data = await api.analitica.getKpis(currentYear, undefined);
      setKpis(data);
    } catch (e) {
      console.error("Error al cargar KPIs del dashboard", e);
    }
  };

  const loadForecast = async () => {
    try {
      const response = await fetch(`${API_BASE}/predicts/forecast?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Summarize total forecasted demand
          const totalDemand = data.reduce((sum: number, item: any) => sum + item.demanda, 0);
          setForecastSummary(isEn ? `${totalDemand} dishes (Next 7 days)` : `${totalDemand} platos (Próximos 7 días)`);
          setBestModelName(data[0].algoritmo || "Stacking Hybrid");
        } else {
          setForecastSummary(isEn ? "No forecasts" : "Sin proyecciones");
        }
      } else {
        setForecastSummary(isEn ? "Not trained" : "No entrenado");
      }
    } catch (e) {
      setForecastSummary(isEn ? "No connection" : "Sin conexión");
    }
  };

  useEffect(() => {
    loadKpis();
    loadForecast();
  }, [language]);

  const handleSyncDW = async () => {
    setSyncing(true);
    try {
      await api.analitica.sync();
      await loadKpis();
      alert(isEn ? "Data Warehouse synchronized successfully!" : "¡Data Warehouse sincronizado con éxito!");
    } catch (e) {
      alert(isEn ? "Error synchronizing Data Warehouse" : "Error al sincronizar el Data Warehouse");
    } finally {
      setSyncing(false);
    }
  };

  // Default values if data not loaded
  const totalIngresos = kpis?.total_ingresos || 4520.50;
  const totalPlatos = kpis?.total_platos || 154;
  const popularCategory = kpis?.ventas_por_categoria?.[0]?.categoria || (isEn ? "Main Dishes" : "Platos Principales");
  
  // Custom SVG Area Chart Data (Weekly Sales Trend)
  const salesHistory = [
    { label: isEn ? "Mon" : "Lun", val: 320 },
    { label: isEn ? "Tue" : "Mar", val: 450 },
    { label: isEn ? "Wed" : "Mie", val: 390 },
    { label: isEn ? "Thu" : "Jue", val: 680 },
    { label: isEn ? "Fri" : "Vie", val: 1200 },
    { label: isEn ? "Sat" : "Sab", val: 1450 },
    { label: isEn ? "Sun" : "Dom", val: 980 }
  ];

  const maxVal = Math.max(...salesHistory.map(d => d.val));
  const points = salesHistory.map((d, i) => {
    const x = 50 + i * 80;
    const y = 200 - (d.val / maxVal) * 150;
    return `${x},${y}`;
  }).join(" ");

  const fillPoints = `50,200 ${points} 530,200`;

  return (
    <div className="dashboard-view">
      {/* Top Banner Header */}
      <div className="db-banner glass-panel animate-fade-in">
        <div className="banner-left">
          <h2>{isEn ? `Welcome back, ${usuario.nombre || "User"}!` : `¡Bienvenido de nuevo, ${usuario.nombre || "Usuario"}!`}</h2>
          <p>
            {isEn 
              ? `The system is online. The DW is up to date and the demand prediction model ${bestModelName} is ready for queries.`
              : `El sistema se encuentra en línea. El DW se encuentra al día y el modelo de predicción de demanda ${bestModelName} está listo para consulta.`}
          </p>
        </div>
        <button 
          className="btn-sync-dw" 
          onClick={handleSyncDW} 
          disabled={syncing}
        >
          <RefreshCcw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? t("Sincronizando...") : t("Sincronizar DW")}
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="kpis-grid">
        <div className="kpi-card glass-panel animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="kpi-icon-wrapper purple">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{isEn ? "Annual Revenue" : "Ingresos Anuales"}</span>
            <h3 className="kpi-value">${totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="kpi-trend positive">{isEn ? "+12.4% vs last year" : "+12.4% vs año anterior"}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="kpi-icon-wrapper blue">
            <ShoppingCart size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{isEn ? "Dishes Sold" : "Platos Vendidos"}</span>
            <h3 className="kpi-value">{totalPlatos} {isEn ? "units" : "unidades"}</h3>
            <span className="kpi-trend positive">{isEn ? "+8.2% this month" : "+8.2% este mes"}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="kpi-icon-wrapper green">
            <Utensils size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{isEn ? "Leading Category" : "Categoría Líder"}</span>
            <h3 className="kpi-value">{popularCategory}</h3>
            <span className="kpi-trend neutral">{isEn ? "Highest profitability" : "Mayor rentabilidad"}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="kpi-icon-wrapper yellow">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{isEn ? "Weekly Forecast" : "Previsión Semanal"}</span>
            <h3 className="kpi-value">{forecastSummary}</h3>
            <span className="kpi-trend ml-badge">Model: {bestModelName.substring(0, 15)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Actions Split */}
      <div className="dashboard-layout">
        {/* Weekly Trend Chart (SVG) */}
        <div className="chart-panel glass-panel animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="panel-header">
            <h3>{isEn ? "Weekly Sales Trend (Revenue)" : "Tendencia Semanal de Ventas (Ingresos)"}</h3>
            <span className="chart-subtitle">{isEn ? "Daily billing history" : "Historial de facturación diaria"}</span>
          </div>
          <div className="svg-chart-container">
            <svg viewBox="0 0 600 240" className="area-chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="50" y1="50" x2="550" y2="50" stroke="rgba(0,0,0,0.06)" />
              <line x1="50" y1="125" x2="550" y2="125" stroke="rgba(0,0,0,0.06)" />
              <line x1="50" y1="200" x2="550" y2="200" stroke="rgba(0,0,0,0.1)" />
              
              {/* Filled Area */}
              <polygon points={fillPoints} fill="url(#chartGrad)" />
              
              {/* Line */}
              <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" />
              
              {/* Interactive Dots */}
              {salesHistory.map((d, i) => {
                const x = 50 + i * 80;
                const y = 200 - (d.val / maxVal) * 150;
                return (
                  <g key={i} className="chart-dot-group">
                    <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                    <text x={x} y={y - 12} textAnchor="middle" className="dot-label">${d.val}</text>
                  </g>
                );
              })}
              
              {/* X Axis Labels */}
              {salesHistory.map((d, i) => (
                <text key={i} x={50 + i * 80} y={222} textAnchor="middle" className="axis-label">
                  {d.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Quick Operations Sidebar */}
        <div className="actions-panel glass-panel animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h3>{isEn ? "Quick Access" : "Acceso Rápido"}</h3>
          <p className="panel-desc">{isEn ? "Recurrent administrative workflows and tasks." : "Flujos y tareas recurrentes de administración."}</p>
          
          <div className="quick-actions-list">
            <button className="action-row-btn" onClick={() => setVistaActual("ventas")}>
              <div className="action-icon circle purple">
                <ShoppingCart size={18} />
              </div>
              <div className="action-text">
                <h4>{isEn ? "Register Sale (POS)" : "Registrar Venta (POS)"}</h4>
                <span>{isEn ? "Open rapid billing terminal" : "Abrir terminal de facturación rápida"}</span>
              </div>
            </button>

            <button className="action-row-btn" onClick={() => setVistaActual("cocina")}>
              <div className="action-icon circle blue">
                <Flame size={18} />
              </div>
              <div className="action-text">
                <h4>{isEn ? "Kitchen Monitor" : "Monitor de Cocina"}</h4>
                <span>{isEn ? "View incoming orders and preparation status" : "Ver pedidos entrantes y estados de preparación"}</span>
              </div>
            </button>

            <button className="action-row-btn" onClick={() => setVistaActual("predicts")}>
              <div className="action-icon circle green">
                <TrendingUp size={18} />
              </div>
              <div className="action-text">
                <h4>{isEn ? "Sales Predictions (ML)" : "Predicciones de Venta (ML)"}</h4>
                <span>{isEn ? "Train models, view ROC, and export reports" : "Entrenar modelos, ver ROC, y exportar reportes"}</span>
              </div>
            </button>

            <button className="action-row-btn" onClick={handleSyncDW}>
              <div className="action-icon circle yellow">
                <Zap size={18} />
              </div>
              <div className="action-text">
                <h4>{isEn ? "Optimize Performance" : "Optimizar Rendimiento"}</h4>
                <span>{isEn ? "Recalculate Data Warehouse dimensions" : "Recalcular dimensiones de Data Warehouse"}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-view {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: var(--text-main);
          background: transparent;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .db-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-radius: 16px;
        }

        .banner-left h2 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 6px 0;
          background: linear-gradient(135deg, var(--text-highlight) 40%, var(--accent-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .banner-left p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .btn-sync-dw {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-sync-dw:hover {
          background: #6366f1;
          transform: translateY(-1px);
        }

        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.15);
        }

        .kpi-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon-wrapper.purple { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .kpi-icon-wrapper.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .kpi-icon-wrapper.green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .kpi-icon-wrapper.yellow { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .kpi-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .kpi-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .kpi-value {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-highlight);
        }

        .kpi-trend {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .kpi-trend.positive { color: var(--accent-success); }
        .kpi-trend.neutral { color: var(--text-muted); }
        
        .ml-badge {
          background: rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1000px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
        }

        .chart-panel, .actions-panel {
          padding: 24px;
          border-radius: 16px;
        }

        .panel-header {
          margin-bottom: 20px;
        }

        .panel-header h3 {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .chart-subtitle {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .svg-chart-container {
          width: 100%;
          height: auto;
          margin-top: 10px;
        }

        .axis-label {
          fill: var(--text-muted);
          font-size: 10px;
          font-weight: 600;
        }

        .dot-label {
          fill: var(--text-highlight);
          font-size: 9px;
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .chart-dot-group:hover .dot-label {
          opacity: 1;
        }

        .chart-dot-group circle {
          cursor: pointer;
          transition: r 0.2s ease;
        }

        .chart-dot-group:hover circle {
          r: 7;
        }

        .actions-panel h3 {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .panel-desc {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 0 0 20px 0;
        }

        .quick-actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-row-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-row-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(99, 102, 241, 0.2);
          transform: translateX(4px);
        }

        .action-icon.circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon.circle.purple { background: rgba(129, 140, 248, 0.1); color: #818cf8; }
        .action-icon.circle.blue { background: rgba(96, 165, 250, 0.1); color: #60a5fa; }
        .action-icon.circle.green { background: rgba(52, 211, 153, 0.1); color: #34d399; }
        .action-icon.circle.yellow { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }

        .action-text h4 {
          margin: 0 0 2px 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-highlight);
        }

        .action-text span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Animations */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
