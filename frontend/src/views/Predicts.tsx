import React, { useState, useEffect } from "react";
import { useTranslation } from "../LanguageContext";
import { API_BASE, BACKEND_URL } from "../api";


import { 
  Sparkles, 
  Calendar, 
  Sliders, 
  Activity, 
  CheckCircle,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  BarChart
} from "lucide-react";

// The 5 Machine Learning models we train on the backend
const ALGORITHMS = [
  { name: "Regresion Lineal", bg: "#fef3c7", color: "#d97706" },
  { name: "Random Forest", bg: "#e0e7ff", color: "#4f46e5" },
  { name: "Red Neuronal MLP", bg: "#fae8ff", color: "#c026d3" },
  { name: "Hibrido Lineal-MLP", bg: "#d1fae5", color: "#059669" },
  { name: "Hibrido Stacking (RF+MLP)", bg: "#e0f2fe", color: "#0284c7" }
];

interface ModelResultRow {
  algoritmo: string;
  r2: number;
  rmse: number;
  mae: number;
  mape: number;
  timeMs: number;
}

interface PredictionRow {
  productoId: number;
  nombre: string;
  fecha: string;
  demanda: number;
  algoritmo: string;
  confianza: number;
}

interface StatisticalTestRow {
  comparador: string;
  t_statistic: number;
  t_p_value: number;
  wilcoxon_statistic: number;
  wilcoxon_p_value: number;
  significativo: boolean;
  interpretacion: string;
}

interface CrossValidationRow {
  algoritmo: string;
  rmse_mean: number;
  rmse_std: number;
  r2_mean: number;
  r2_std: number;
}

interface EdaProductStat {
  nombre: string;
  mean: number;
  std: number;
  min: number;
  max: number;
}

interface EdaStats {
  count: number;
  mean: number;
  std: number;
  median: number;
  min: number;
  max: number;
  prod_stats: EdaProductStat[];
}

export const Predicts: React.FC = () => {
  const { t, language } = useTranslation();
  const isEn = language === "en";

  const [comparing, setComparing] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [runningCv, setRunningCv] = useState<boolean>(false);
  const [loadingEda, setLoadingEda] = useState<boolean>(false);

  // Core Data States
  const [modelResults, setModelResults] = useState<ModelResultRow[]>([]);
  const [bestModelName, setBestModelName] = useState<string>("");
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [statTests, setStatTests] = useState<StatisticalTestRow[]>([]);
  const [cvResults, setCvResults] = useState<CrossValidationRow[]>([]);
  const [edaStats, setEdaStats] = useState<EdaStats | null>(null);
  
  // Tuning parameters output
  const [tunedParams, setTunedParams] = useState<any>(null);
  
  // Configs
  const [cvFolds, setCvFolds] = useState<number>(5);
  const [chartsVersion, setChartsVersion] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<"train" | "cv" | "tuning" | "stats" | "eda">("train");
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    // Silent pre-load of predictions if model is already trained
    fetchForecast();
  }, [language]);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // FETCH FORECAST DIRECTLY
  const fetchForecast = async () => {
    try {
      const res = await fetch(`${API_BASE}/predicts/forecast?lang=${language}`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data || []);
      }
    } catch (e) {
      console.error("Error fetching forecast", e);
    }
  };

  // 1. COMPARAR Y ENTRENAR MODELOS
  const handleCompareModels = async () => {
    setComparing(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/train?lang=${language}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Error en el servidor");
      const data = await res.json();
      
      // Parse dictionary of metrics
      const rows: ModelResultRow[] = Object.entries(data.results).map(([key, val]: [string, any]) => ({
        algoritmo: key,
        r2: val.r2,
        rmse: val.rmse,
        mae: val.mae,
        mape: val.mape,
        timeMs: val.time_ms
      }));
      
      setModelResults(rows);
      setBestModelName(data.best_model);
      setChartsVersion(Date.now()); // Refresh charts to bypass cache
      triggerToast(isEn ? "The 5 models have been retrained and evaluated on the server!" : "¡Los 5 modelos han sido reentrenados y evaluados en el servidor!");
      // Automatically refresh demand forecast table
      fetchForecast();
    } catch (e) {
      triggerToast(isEn ? "An error occurred while training models." : "Ocurrió un error al entrenar los modelos.", "info");
    } finally {
      setComparing(false);
    }
  };

  // 2. GENERAR PREDICCIONES (7 DÍAS EN ADELANTE)
  const handleGeneratePredictions = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/forecast?lang=${language}`);
      if (!res.ok) throw new Error("Error en el servidor");
      const data = await res.json();
      setPredictions(data || []);
      triggerToast(isEn ? "Suggested demand predictions for the next 7 days generated!" : "¡Predicciones de demanda sugeridas para los próximos 7 días!");
    } catch (e) {
      triggerToast(isEn ? "Error obtaining demand projection." : "Error al obtener la proyección de demanda.", "info");
    } finally {
      setGenerating(false);
    }
  };

  // 3. OPTIMIZAR HIPERPARÁMETROS
  const handleOptimizeHyperparameters = async () => {
    setOptimizing(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/tune`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Error en el tuning");
      const data = await res.json();
      setTunedParams(data);
      triggerToast(isEn ? "Hyperparameters optimized with GridSearchCV successfully." : "Hiperparámetros optimizados con GridSearchCV exitosamente.");
    } catch (e) {
      triggerToast(isEn ? "Error tuning parameters." : "Error al sintonizar parámetros.", "info");
    } finally {
      setOptimizing(false);
    }
  };

  // 4. EJECUTAR VALIDACIÓN ESTADÍSTICA (WILCOXON & T-TEST)
  const handleStatisticalValidation = async () => {
    setValidating(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/statistical_tests?lang=${language}`);
      if (!res.ok) throw new Error("Error en test");
      const data = await res.json();
      setStatTests(data || []);
      triggerToast(isEn ? "Statistical tests executed on absolute residuals." : "Pruebas estadísticas ejecutadas sobre los residuos absolutos.");
    } catch (e) {
      triggerToast(isEn ? "Error executing statistical analysis." : "Error al ejecutar análisis estadístico.", "info");
    } finally {
      setValidating(false);
    }
  };

  // 5. VALIDACIÓN CRUZADA
  const handleRunCrossValidation = async () => {
    setRunningCv(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/cross_validation?folds=${cvFolds}`);
      if (!res.ok) throw new Error("Error en CV");
      const data = await res.json();
      const rows: CrossValidationRow[] = Object.entries(data).map(([key, val]: [string, any]) => ({
        algoritmo: key,
        rmse_mean: val.rmse_mean,
        rmse_std: val.rmse_std,
        r2_mean: val.r2_mean,
        r2_std: val.r2_std
      }));
      setCvResults(rows);
      triggerToast(isEn ? `Cross Validation completed in K=${cvFolds} folds.` : `Validación Cruzada completada en K=${cvFolds} folds.`);
    } catch (e) {
      triggerToast(isEn ? "Error running Cross Validation." : "Error al correr Validación Cruzada.", "info");
    } finally {
      setRunningCv(false);
    }
  };

  // 6. CARGAR EDA ESTADÍSTICOS
  const handleLoadEda = async () => {
    setLoadingEda(true);
    try {
      const res = await fetch(`${API_BASE}/predicts/eda`);
      if (!res.ok) throw new Error("Error en EDA");
      const data = await res.json();
      setEdaStats(data);
      triggerToast(isEn ? "Historical data descriptively analyzed." : "Datos históricos analizados descriptivamente.");
    } catch (e) {
      triggerToast(isEn ? "Error loading EDA descriptors." : "Error al cargar descriptivos EDA.", "info");
    } finally {
      setLoadingEda(false);
    }
  };

  const getTranslatedAlgoName = (name: string) => {
    if (!isEn) return name;
    if (name === "Regresion Lineal") return "Linear Regression";
    if (name === "Random Forest") return "Random Forest";
    if (name === "Red Neuronal MLP") return "MLP Neural Network";
    if (name === "Hibrido Lineal-MLP") return "Linear-MLP Hybrid";
    if (name === "Hibrido Stacking (RF+MLP)") return "Stacking Hybrid (RF+MLP)";
    return name;
  };

  return (
    <div className="predicts-demand-view">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <CheckCircle size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="demand-header-panel glass-panel">
        <div className="demand-header-left">
          <div className="demand-title-row">
            <span className="brain-emoji" role="img" aria-label="brain">🧠</span>
            <h1>{t("Redes Neuronales y Predicción de Demanda")}</h1>
          </div>
          <div className="algorithms-badges-row">
            {ALGORITHMS.map((algo, i) => (
              <span 
                key={i} 
                className="algo-badge"
                style={{ backgroundColor: algo.bg, color: algo.color }}
              >
                {getTranslatedAlgoName(algo.name)}
              </span>
            ))}
          </div>
        </div>
        
        {/* Reports Download Area */}
        <div className="download-reports-area">
          <span className="download-label">{isEn ? "Download Reports:" : "Descargar Reportes Científicos:"}</span>
          <a href={`${API_BASE}/predicts/reports/pdf?lang=${language}`} target="_blank" rel="noreferrer" className="btn-report-download pdf">
            <FileText size={16} />
            PDF
          </a>
          <a href={`${API_BASE}/predicts/reports/word?lang=${language}`} target="_blank" rel="noreferrer" className="btn-report-download docx">
            <FileText size={16} />
            Word
          </a>
          <a href={`${API_BASE}/predicts/reports/excel?lang=${language}`} target="_blank" rel="noreferrer" className="btn-report-download xlsx">
            <FileSpreadsheet size={16} />
            Excel
          </a>
        </div>
      </div>

      {/* Button Operations Row */}
      <div className="operations-buttons-row">
        <button 
          className="op-btn purple" 
          onClick={handleCompareModels}
          disabled={comparing}
        >
          <Sparkles size={16} className={comparing ? "animate-spin" : ""} />
          {comparing ? t("Entrenando Modelos...") : t("Comparar 5 Modelos (Servidor)")}
        </button>
        <button 
          className="op-btn blue" 
          onClick={handleGeneratePredictions}
          disabled={generating}
        >
          <Calendar size={16} className={generating ? "animate-spin" : ""} />
          {generating ? t("Proyectando...") : t("Generar Predicciones (7 días)")}
        </button>
        <button 
          className="op-btn dark-blue" 
          onClick={handleOptimizeHyperparameters}
          disabled={optimizing}
        >
          <Sliders size={16} className={optimizing ? "animate-spin" : ""} />
          {optimizing ? t("Sintonizando...") : t("Tuning Hiperparámetros")}
        </button>
        <button 
          className="op-btn yellow-blue" 
          onClick={handleLoadEda}
          disabled={loadingEda}
        >
          <BarChart size={16} className={loadingEda ? "animate-spin" : ""} />
          {loadingEda ? t("Calculando...") : t("Análisis EDA Descriptivo")}
        </button>
      </div>

      {/* Navigation tabs for pipeline parts */}
      <div className="pipeline-tabs-nav glass-panel">
        <button className={`tab-nav-btn ${activeTab === "train" ? "active" : ""}`} onClick={() => setActiveTab("train")}>
          {t("1 & 2. Entrenamiento y Curvas")}
        </button>
        <button className={`tab-nav-btn ${activeTab === "cv" ? "active" : ""}`} onClick={() => setActiveTab("cv")}>
          {t("3. Validación Cruzada (K-Fold)")}
        </button>
        <button className={`tab-nav-btn ${activeTab === "tuning" ? "active" : ""}`} onClick={() => setActiveTab("tuning")}>
          {t("4. Hiperparámetros (Tuning)")}
        </button>
        <button className={`tab-nav-btn ${activeTab === "stats" ? "active" : ""}`} onClick={() => { setActiveTab("stats"); handleStatisticalValidation(); }}>
          {t("5. Pruebas Estadísticas Robustas")}
        </button>
        <button className={`tab-nav-btn ${activeTab === "eda" ? "active" : ""}`} onClick={() => { setActiveTab("eda"); handleLoadEda(); }}>
          {t("Fase EDA Histórico")}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-panels-container">
        
        {/* PANEL 1: ENTRENAMIENTO Y CURVAS */}
        {activeTab === "train" && (
          <div className="tab-pane animate-fade-in">
            <div className="demand-glass-panel">
              <div className="panel-title-row">
                <span className="trophy-emoji" role="img" aria-label="trophy">🏆</span>
                <h3>{t("Precisión de los Modelos Entrenados")}</h3>
              </div>
              
              {comparing ? (
                <div className="table-loader-wrapper">
                  <div className="spinner"></div>
                  <span>{t("Entrenando modelos lineales, bosques y redes neuronales en el servidor...")}</span>
                </div>
              ) : modelResults.length === 0 ? (
                <div className="empty-table-placeholder">
                  <Activity size={32} className="text-muted" />
                  <span>{t("Presione \"Comparar 5 Modelos (Servidor)\" para iniciar el entrenamiento y obtener estadísticos.")}</span>
                </div>
              ) : (
                <div className="demand-table-container">
                  <table className="demand-custom-table">
                    <thead>
                      <tr>
                        <th>{t("ALGORITMO")}</th>
                        <th>{t("R² (PRECISIÓN)")}</th>
                        <th>{t("RMSE (ERROR MEDIO)")}</th>
                        <th>{t("MAE (ERR. ABSOLUTO)")}</th>
                        <th>{t("MAPE (ERROR %)")}</th>
                        <th>{t("TIEMPO DE PROCESO")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelResults.map((row, idx) => {
                        const isBest = row.algoritmo === bestModelName;
                        let r2Color = "#ef4444";
                        if (row.r2 > 0.7) r2Color = "#10b981";
                        else if (row.r2 > 0.5) r2Color = "#f59e0b";

                        return (
                          <tr key={idx} className={isBest ? "best-model-row" : ""}>
                            <td className="product-name-cell">
                              {getTranslatedAlgoName(row.algoritmo)} {isBest && (isEn ? " 🌟 (Best Model)" : " 🌟 (Mejor Modelo)")}
                            </td>
                            <td className="metric-r2" style={{ color: r2Color }}>
                              {(row.r2 * 100).toFixed(1)}%
                            </td>
                            <td className="metric-rmse">{row.rmse.toFixed(3)}</td>
                            <td>{row.mae.toFixed(3)}</td>
                            <td>{row.mape.toFixed(1)}%</td>
                            <td className="algo-cell">{row.timeMs.toFixed(2)} ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CURVES AND CHARTS GENERATED BY BACKEND */}
            {modelResults.length > 0 && (
              <div className="charts-visual-grid">
                <div className="demand-glass-panel chart-box">
                  <h4>{t("Matriz de Confusión (Heatmap)")}</h4>
                  <p className="chart-explanation">
                    {t("Clasificación de la demanda en tres rangos (Baja, Media, Alta). Indica el acierto diagonal del modelo óptimo.")}
                  </p>
                  <div className="image-wrapper">
                    <img 
                      src={`${BACKEND_URL}/static/img/confusion_matrix${language === "en" ? "_en" : ""}.png?v=${chartsVersion}`} 
                      alt="Matriz de Confusión" 
                      className="real-chart-img"
                    />
                  </div>
                </div>

                <div className="demand-glass-panel chart-box">
                  <h4>{t("Curvas ROC Comparativas (Macro)")}</h4>
                  <p className="chart-explanation">
                    {t("Comparativa de la tasa de verdaderos positivos contra falsos positivos para cada uno de los 5 modelos (Promedio Macro). Un AUC mayor a 0.8 indica alta especificidad.")}
                  </p>
                  <div className="image-wrapper">
                    <img 
                      src={`${BACKEND_URL}/static/img/roc_curve${language === "en" ? "_en" : ""}.png?v=${chartsVersion}`} 
                      alt="Curva ROC" 
                      className="real-chart-img"
                    />
                  </div>
                </div>

                <div className="demand-glass-panel chart-box">
                  <h4>{t("Comparativa de Métricas (Heatmap)")}</h4>
                  <p className="chart-explanation">
                    {t("Comparación del rendimiento (R², RMSE, MAE, MAPE) de los 5 modelos. El color representa el desempeño relativo (Verde = Mejor, Rojo = Peor).")}
                  </p>
                  <div className="image-wrapper">
                    <img 
                      src={`${BACKEND_URL}/static/img/heatmap_corr${language === "en" ? "_en" : ""}.png?v=${chartsVersion}`} 
                      alt="Mapa de Calor Comparativo de Métricas" 
                      className="real-chart-img"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: VALIDACIÓN CRUZADA */}
        {activeTab === "cv" && (
          <div className="tab-pane animate-fade-in">
            <div className="demand-glass-panel">
              <div className="panel-title-row flex-header-between">
                <h3>{t("Validación Cruzada K-Fold Configurable")}</h3>
                <div className="cv-controls">
                  <label htmlFor="folds-slider">{isEn ? "Folds" : "Folds (K)"}: {cvFolds}</label>
                  <input 
                    id="folds-slider"
                    type="range" 
                    min="2" 
                    max="10" 
                    value={cvFolds} 
                    onChange={(e) => setCvFolds(parseInt(e.target.value))}
                    disabled={runningCv}
                  />
                  <button className="op-btn purple mini-btn" onClick={handleRunCrossValidation} disabled={runningCv}>
                    {runningCv ? t("Corriendo...") : t("Ejecutar")}
                  </button>
                </div>
              </div>
              <p className="panel-subtitle">
                {isEn 
                  ? "Evaluates predictability stability by partitioning history into K homogeneous subsets."
                  : "Evalúa la estabilidad de las redes neuronales y regresores dividiendo los datos en K partes homogéneas."}
              </p>

              {runningCv ? (
                <div className="table-loader-wrapper">
                  <div className="spinner"></div>
                  <span>{t("Corriendo entrenamiento iterativo en K={folds} folds...", { folds: cvFolds })}</span>
                </div>
              ) : cvResults.length === 0 ? (
                <div className="empty-table-placeholder">
                  <span>{t("Ajuste el número de folds y pulse \"Ejecutar\" para visualizar los puntajes promedios.")}</span>
                </div>
              ) : (
                <div className="demand-table-container">
                  <table className="demand-custom-table">
                    <thead>
                      <tr>
                        <th>{t("ALGORITMO")}</th>
                        <th>{t("R² PROMEDIO (MEAN)")}</th>
                        <th>{t("R² DESVIACIÓN (STD)")}</th>
                        <th>{t("RMSE PROMEDIO (MEAN)")}</th>
                        <th>{t("RMSE DESVIACIÓN (STD)")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cvResults.map((row, idx) => (
                        <tr key={idx}>
                          <td className="product-name-cell">{getTranslatedAlgoName(row.algoritmo)}</td>
                          <td className="font-bold text-green">{(row.r2_mean * 100).toFixed(1)}%</td>
                          <td>{(row.r2_std * 100).toFixed(2)}%</td>
                          <td className="font-bold">{row.rmse_mean.toFixed(3)}</td>
                          <td>{row.rmse_std.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 3: TUNING HIPERPARÁMETROS */}
        {activeTab === "tuning" && (
          <div className="tab-pane animate-fade-in">
            <div className="demand-glass-panel">
              <div className="panel-title-row">
                <h3>{t("Sintonía Fina y Búsqueda en Rejilla (GridSearchCV)")}</h3>
              </div>
              <p className="panel-subtitle">
                {t("Ajusta las neuronas de la red MLP y los estimadores del Bosque Aleatorio para maximizar el ajuste R².")}
              </p>

              {optimizing ? (
                <div className="table-loader-wrapper">
                  <div className="spinner"></div>
                  <span>{t("Realizando GridSearch en el servidor FastAPI...")}</span>
                </div>
              ) : !tunedParams ? (
                <div className="empty-table-placeholder">
                  <span>{t("Pulse \"Tuning Hiperparámetros\" en las opciones superiores para ver los parámetros optimizados.")}</span>
                </div>
              ) : (
                <div className="tuning-results-box">
                  <div className="metrics-summary-alert">
                    <h4>{isEn ? "Optimization Complete!" : "¡Optimización Completada!"}</h4>
                    <p>
                      {isEn 
                        ? `Hyperparameters tuning reports an estimated optimal RMSE of: `
                        : `El tuning de hiperparámetros de las Redes Neuronales reporta un RMSE óptimo estimado de: `}
                      <strong> {tunedParams.best_rmse} {isEn ? "units" : "unidades"}</strong>.
                    </p>
                  </div>
                  <div className="params-json-render">
                    <h5>{isEn ? "Selected Winning Parameters:" : "Parámetros Ganadores Seleccionados:"}</h5>
                    <pre>{JSON.stringify(tunedParams.best_params, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 4: PRUEBAS ESTADÍSTICAS */}
        {activeTab === "stats" && (
          <div className="tab-pane animate-fade-in">
            <div className="demand-glass-panel">
              <div className="panel-title-row">
                <h3>{t("Pruebas Estadísticas Robustas de Validación")}</h3>
              </div>
              <p className="panel-subtitle">
                {t("Evalúa si las diferencias de predicción del modelo óptimo respecto a los demás son estadísticamente significativas (Alpha=0.05).")}
              </p>

              {validating ? (
                <div className="table-loader-wrapper">
                  <div className="spinner"></div>
                  <span>{isEn ? "Calculating Wilcoxon and Student-T p-values..." : "Calculando p-valores de Wilcoxon y Student-T..."}</span>
                </div>
              ) : statTests.length === 0 ? (
                <div className="empty-table-placeholder">
                  <span>{isEn ? "No significance analysis loaded." : "No hay análisis de significancia cargado."}</span>
                </div>
              ) : (
                <div className="demand-table-container">
                  <table className="demand-custom-table">
                    <thead>
                      <tr>
                        <th>{t("MODELO COMPARADOR")}</th>
                        <th>{t("T-TEST (P-VALUE)")}</th>
                        <th>{t("WILCOXON (P-VALUE)")}</th>
                        <th>{t("SIGNIFICATIVO")}</th>
                        <th>{t("INTERPRETACIÓN")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statTests.map((row, idx) => {
                        let interpret = row.interpretacion;
                        if (isEn) {
                          const isSig = row.significativo;
                          interpret = `The model ${bestModelName} is statistically ${isSig ? 'superior and significant' : 'similar'} compared to ${row.comparador} (p=${row.wilcoxon_p_value.toFixed(5)})`;
                        }
                        return (
                          <tr key={idx}>
                            <td className="product-name-cell">{getTranslatedAlgoName(row.comparador)}</td>
                            <td>{row.t_p_value.toFixed(6)}</td>
                            <td className="font-bold">{row.wilcoxon_p_value.toFixed(6)}</td>
                            <td>
                              <span className={`sig-badge ${row.significativo ? "yes" : "no"}`}>
                                {row.significativo ? (isEn ? "YES" : "SÍ") : "NO"}
                              </span>
                            </td>
                            <td className="italic-text">{interpret}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 5: EDA HISTÓRICO */}
        {activeTab === "eda" && (
          <div className="tab-pane animate-fade-in">
            <div className="demand-glass-panel">
              <div className="panel-title-row">
                <h3>{t("Análisis Exploratorio y Descriptivos (EDA)")}</h3>
              </div>
              
              {loadingEda ? (
                <div className="table-loader-wrapper">
                  <div className="spinner"></div>
                  <span>{t("Calculando descriptivos del historial de ventas...")}</span>
                </div>
              ) : !edaStats ? (
                <div className="empty-table-placeholder">
                  <span>{isEn ? "No EDA statistics available." : "No hay datos de EDA disponibles."}</span>
                </div>
              ) : (
                <div className="eda-content-wrapper">
                  {/* General KPIs */}
                  <div className="eda-kpis-row">
                    <div className="eda-kpi">
                      <span className="label">{isEn ? "Total Observations" : "Total Observaciones"}</span>
                      <span className="value">{edaStats.count} {isEn ? "days" : "días"}</span>
                    </div>
                    <div className="eda-kpi">
                      <span className="label">{isEn ? "Average Demand" : "Demanda Promedio"}</span>
                      <span className="value">{edaStats.mean} {isEn ? "units" : "uds"}</span>
                    </div>
                    <div className="eda-kpi">
                      <span className="label">{isEn ? "Volatility (StdDev)" : "Volatilidad (StdDev)"}</span>
                      <span className="value">{edaStats.std} {isEn ? "units" : "uds"}</span>
                    </div>
                    <div className="eda-kpi">
                      <span className="label">{isEn ? "Maximum Demand" : "Demanda Máxima"}</span>
                      <span className="value">{edaStats.max} {isEn ? "units" : "uds"}</span>
                    </div>
                  </div>

                  {/* Product stats table */}
                  <div className="eda-table-title">
                    <h4>{isEn ? "Descriptive Breakdown by Product" : "Desglose Descriptivo por Producto"}</h4>
                  </div>
                  <div className="demand-table-container">
                    <table className="demand-custom-table">
                      <thead>
                        <tr>
                          <th>{t("PRODUCTO")}</th>
                          <th>{t("DEMANDA PROMEDIO")}</th>
                          <th>{t("DESVIACIÓN ESTÁNDAR")}</th>
                          <th>{isEn ? "DAILY MINIMUM" : "MÍNIMO DIARIO"}</th>
                          <th>{isEn ? "DAILY MAXIMUM" : "MÁXIMO DIARIO"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edaStats.prod_stats.map((row, idx) => (
                          <tr key={idx}>
                            <td className="product-name-cell">{row.nombre}</td>
                            <td className="font-bold">{row.mean.toFixed(2)} {isEn ? "units" : "uds"}</td>
                            <td>{row.std.toFixed(2)} {isEn ? "units" : "uds"}</td>
                            <td>{row.min} {isEn ? "units" : "uds"}</td>
                            <td className="font-bold text-purple">{row.max} {isEn ? "units" : "uds"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table 2: Predicciones Actuales (Próximos 7 días) */}
      <div className="demand-glass-panel">
        <div className="panel-title-row">
          <TrendingUp size={18} className="text-primary" />
          <h3>{isEn ? "Suggested Demand Predictions (Next 7 Days)" : "Predicciones de Demanda Sugeridas (Próximos 7 Días)"}</h3>
        </div>

        {generating ? (
          <div className="table-loader-wrapper">
            <div className="spinner"></div>
            <span>{isEn ? "Generating forecasts with optimal model..." : "Generando proyecciones con el modelo óptimo..."}</span>
          </div>
        ) : predictions.length === 0 ? (
          <div className="empty-table-placeholder">
            <span>{isEn ? "Press 'Generate Predictions' to forecast demand." : "Presione \"Generar Predicciones\" para proyectar la demanda."}</span>
          </div>
        ) : (
          <div className="demand-table-container scrollable-table">
            <table className="demand-custom-table">
              <thead>
                <tr>
                  <th>{t("PRODUCTO")}</th>
                  <th>{isEn ? "DATE" : "FECHA"}</th>
                  <th>{isEn ? "SUGGESTED DEMAND" : "DEMANDA SUGERIDA"}</th>
                  <th>{isEn ? "PREDICTIVE ALGORITHM" : "ALGORITMO PREDICTOR"}</th>
                  <th>{isEn ? "CONFIDENCE LEVEL" : "NIVEL CONFIANZA"}</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((row, idx) => (
                  <tr key={idx}>
                    <td className="product-name-cell">{row.nombre}</td>
                    <td className="date-cell">{row.fecha}</td>
                    <td className="demand-cell">{row.demanda} {isEn ? "units" : "unidades"}</td>
                    <td className="algo-cell">{getTranslatedAlgoName(row.algoritmo)}</td>
                    <td className="confidence-cell">{row.confianza.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .flex-header-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          flex-wrap: wrap;
          gap: 12px;
        }

        .panel-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: -8px;
          margin-bottom: 16px;
        }

        .text-purple { color: #4f46e5; }
        .text-green { color: var(--accent-success); }
        .font-bold { font-weight: 700; }
        .italic-text { font-style: italic; font-size: 0.85rem; color: var(--text-muted); }

        .predicts-demand-view {
          padding: 24px;
          background-color: transparent;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1100;
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #10b981;
          color: #ffffff;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .demand-header-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-radius: 16px;
        }

        .demand-header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .demand-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brain-emoji { font-size: 1.8rem; }

        .demand-title-row h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, var(--text-highlight) 40%, var(--accent-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .algorithms-badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .algo-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .download-reports-area {
          display: flex;
          gap: 10px;
        }

        .btn-report-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: white;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-report-download.pdf { background-color: #ef4444; }
        .btn-report-download.docx { background-color: #3b82f6; }
        .btn-report-download.xlsx { background-color: #10b981; }

        .btn-report-download:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .operations-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .op-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .op-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .op-btn.purple { background-color: #4f46e5; }
        .op-btn.blue { background-color: #2563eb; }
        .op-btn.dark-blue { background-color: #1e3a8a; }
        .op-btn.yellow-blue { background-color: #0891b2; }

        .op-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pipeline-tabs-nav {
          display: flex;
          gap: 8px;
          padding: 6px;
          border-radius: 12px;
          overflow-x: auto;
        }

        .tab-nav-btn {
          flex: 1;
          min-width: 140px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-nav-btn:hover {
          color: var(--text-highlight);
          background: rgba(0, 0, 0, 0.04);
        }

        .tab-nav-btn.active {
          background: #4f46e5;
          color: white;
        }

        .demand-glass-panel {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--card-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-premium);
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 12px;
        }

        .panel-title-row h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-highlight);
        }

        .empty-table-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 50px 20px;
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .table-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 50px;
          color: var(--text-muted);
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: #818cf8;
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .demand-table-container {
          width: 100%;
          overflow-x: auto;
        }

        .scrollable-table {
          max-height: 400px;
          overflow-y: auto;
        }

        .demand-custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .demand-custom-table th {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          background-color: rgba(0, 0, 0, 0.01);
          border-bottom: 1px solid var(--card-border);
        }

        .demand-custom-table td {
          padding: 16px;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--card-border);
          color: var(--text-main);
        }

        .demand-custom-table tr:hover td {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .best-model-row td {
          background-color: rgba(99, 102, 241, 0.08);
          color: var(--text-highlight);
          font-weight: 600;
        }

        .product-name-cell {
          font-weight: 600;
          color: var(--text-highlight);
        }

        .metric-r2 { font-weight: 700; }
        .metric-rmse { font-weight: 600; }
        .date-cell { color: var(--text-muted); }
        .demand-cell { font-weight: 700; color: var(--text-highlight); }
        .algo-cell { color: var(--text-muted); }
        .confidence-cell { font-weight: 700; color: var(--accent-success); }

        .charts-visual-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 24px;
        }

        .chart-box h4 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .chart-explanation {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0 0 16px 0;
        }

        .image-wrapper {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: center;
          border: 1px solid var(--card-border);
        }

        .real-chart-img {
          width: 100%;
          max-width: 750px;
          height: auto;
          border-radius: 4px;
        }

        .cv-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .cv-controls input[type="range"] {
          width: 100px;
          cursor: pointer;
        }

        .mini-btn {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .tuning-results-box {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metrics-summary-alert {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--accent-success);
          padding: 16px;
          border-radius: 8px;
        }

        .metrics-summary-alert h4 {
          margin: 0 0 6px 0;
          font-size: 1rem;
        }

        .metrics-summary-alert p {
          margin: 0;
          font-size: 0.9rem;
        }

        .params-json-render h5 {
          margin: 0 0 10px 0;
          font-size: 0.95rem;
          color: var(--text-highlight);
        }

        .params-json-render pre {
          background: rgba(0, 0, 0, 0.03);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--card-border);
          font-family: 'Courier New', Courier, monospace;
          color: var(--accent-primary);
          font-size: 0.9rem;
          margin: 0;
        }

        .sig-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .sig-badge.yes { background-color: rgba(16, 185, 129, 0.15); color: var(--accent-success); }
        .sig-badge.no { background-color: rgba(239, 68, 68, 0.15); color: var(--accent-danger); }

        .eda-kpis-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .eda-kpi {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .eda-kpi .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .eda-kpi .value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-highlight);
        }

        .eda-table-title {
          margin-bottom: 12px;
        }

        .eda-table-title h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
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
      `}</style>
    </div>
  );
};
