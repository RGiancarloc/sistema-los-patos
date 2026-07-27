import React, { useState, useEffect } from "react";
import { api, API_BASE } from "../api";
import type { VentaEncabezado } from "../api";
import { History, FileText, Receipt, Trash2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useTranslation } from "../LanguageContext";

export const Historial: React.FC = () => {
  const [ventas, setVentas] = useState<VentaEncabezado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedVentaId, setExpandedVentaId] = useState<number | null>(null);
  const { language } = useTranslation();
  const isEn = language === "en";

  const loadHistorial = async () => {
    setLoading(true);
    try {
      const data = await api.ventas.getAll();
      // Sort by ventaId descending (most recent first)
      data.sort((a, b) => b.ventaId - a.ventaId);
      setVentas(data);
    } catch (err: any) {
      setError(isEn ? "Error loading sales history" : "Error al cargar el historial de ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const handleToggleExpand = (id: number) => {
    setExpandedVentaId(expandedVentaId === id ? null : id);
  };

  const handleDeleteVenta = async (id: number) => {
    if (!window.confirm(isEn ? `Are you sure you want to permanently delete sale #${id}?` : `¿Está seguro de eliminar de forma permanente la venta #${id}?`)) return;
    try {
      await api.ventas.delete(id);
      loadHistorial();
    } catch (err: any) {
      alert(isEn ? "Could not delete sale" : "No se pudo eliminar la venta");
    }
  };

  const handleDownloadPdf = (id: number, type: "ticket" | "factura") => {
    const url = `${API_BASE}/ventas/${id}/${type}`;
    window.open(url, "_blank");
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "";
    return isoStr.substring(0, 16).replace("T", " ");
  };

  const handleDownloadCsv = () => {
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += isEn
      ? "Sale ID,Date,Customer,Waiter,Table,Subtotal,Taxes,Tip,Discount,Final Total,Payment Method\n"
      : "Venta ID,Fecha,Cliente,Mesero,Mesa,Subtotal,Impuestos,Propina,Descuento,Total Final,Método de Pago\n";

    ventas.forEach((v) => {
      const cName = v.cliente ? v.cliente.nombre : (isEn ? "Final Consumer" : "Consumidor Final");
      const eName = v.empleado ? v.empleado.nombre : "N/A";
      const mNum = v.mesa ? (isEn ? `Table ${v.mesa.numeroMesa}` : `Mesa ${v.mesa.numeroMesa}`) : (isEn ? "To Go" : "Para Llevar");
      const payMethod = v.metodoPago ? (isEn && v.metodoPago === "efectivo" ? "cash" : isEn && v.metodoPago === "tarjeta" ? "card" : v.metodoPago) : (isEn ? "Unspecified" : "No especificado");
      csvContent += `${v.ventaId},${formatDate(v.fechaHora)},"${cName}","${eName}","${mNum}",${v.subtotal},${v.impuestos},${v.propina},${v.descuentoAplicado},${v.totalFinal},"${payMethod}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", isEn ? "sales_history.csv" : "historial_ventas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in view-layout">
      <div className="view-header">
        <div>
          <h1 className="page-title">{isEn ? "Sales History" : "Historial de Ventas"}</h1>
          <p className="page-subtitle">
            {isEn ? "View and download payment receipts from previous transactions" : "Consulte y descargue comprobantes de pago de transacciones anteriores"}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleDownloadCsv} disabled={ventas.length === 0}>
          <Download size={16} />
          {isEn ? "Export CSV" : "Exportar CSV"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="glass-panel table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>{isEn ? "Searching transaction history..." : "Buscando historial de transacciones..."}</span>
          </div>
        ) : ventas.length === 0 ? (
          <div className="empty-container">
            <History size={48} className="empty-icon" />
            <h3>{isEn ? "No sales records found" : "No se encontraron registros de ventas"}</h3>
            <p>{isEn ? "Sales you make in the POS section will appear registered here." : "Las ventas que realice en la sección POS aparecerán registradas aquí."}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>{isEn ? "Sale ID" : "ID Venta"}</th>
                  <th>{isEn ? "Date" : "Fecha"}</th>
                  <th>{isEn ? "Customer" : "Cliente"}</th>
                  <th>{isEn ? "Table" : "Mesa"}</th>
                  <th>{isEn ? "Waiter" : "Mesero"}</th>
                  <th>{isEn ? "Final Total" : "Total Final"}</th>
                  <th style={{ textAlign: "center" }}>{isEn ? "Receipts" : "Comprobantes"}</th>
                  <th style={{ textAlign: "center" }}>{isEn ? "Actions" : "Acciones"}</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => {
                  const isExpanded = expandedVentaId === v.ventaId;
                  const clienteNombre = v.cliente ? v.cliente.nombre : (isEn ? "Final Consumer" : "Consumidor Final");
                  const mesaStr = v.mesa ? (isEn ? `Table ${v.mesa.numeroMesa}` : `Mesa ${v.mesa.numeroMesa}`) : (isEn ? "To Go" : "Para Llevar");
                  const meseroStr = v.empleado ? v.empleado.nombre : "N/A";

                  return (
                    <React.Fragment key={v.ventaId}>
                      <tr className="main-row" onClick={() => handleToggleExpand(v.ventaId)}>
                        <td>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td className="font-bold text-white">#{v.ventaId}</td>
                        <td>{formatDate(v.fechaHora)}</td>
                        <td>{clienteNombre}</td>
                        <td>
                          <span className="badge badge-primary">{mesaStr}</span>
                        </td>
                        <td>{meseroStr}</td>
                        <td className="text-success font-bold">${v.totalFinal.toFixed(2)}</td>
                        <td style={{ textAlign: "center" }}>
                          <div className="receipt-actions">
                            <button
                              className="btn btn-secondary btn-compact"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf(v.ventaId, "ticket");
                                }}
                              title={isEn ? "View Sale Ticket" : "Ver Ticket de Venta"}
                            >
                              <Receipt size={13} />
                              Ticket
                            </button>
                            <button
                              className="btn btn-secondary btn-compact"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf(v.ventaId, "factura");
                                }}
                              title={isEn ? "View Electronic Invoice" : "Ver Factura Electrónica"}
                            >
                              <FileText size={13} />
                              {isEn ? "Invoice" : "Factura"}
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleDeleteVenta(v.ventaId)}
                            title={isEn ? "Delete sale permanently" : "Eliminar venta permanentemente"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="details-row">
                          <td colSpan={9}>
                            <div className="details-expanded glass-card animate-fade-in">
                              <h4 className="details-title">{isEn ? "Order Products" : "Productos del Pedido"}</h4>
                              <table className="details-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? "Product" : "Producto"}</th>
                                    <th>{isEn ? "Quantity" : "Cantidad"}</th>
                                    <th>{isEn ? "Unit Price" : "P. Unitario"}</th>
                                    <th>Subtotal</th>
                                    <th>{isEn ? "Kitchen Status" : "Estado Cocina"}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.detalles && v.detalles.length > 0 ? (
                                    v.detalles.map((det) => (
                                      <tr key={det.detalleId}>
                                        <td>{det.producto ? det.producto.nombre : (isEn ? "Deleted Product" : "Producto Eliminado")}</td>
                                        <td>{det.cantidad}</td>
                                        <td>${det.precioUnitarioMomento.toFixed(2)}</td>
                                        <td>${(det.precioUnitarioMomento * det.cantidad).toFixed(2)}</td>
                                        <td>
                                          <span className={`badge ${det.estadoCocina === "listo" ? "badge-success" :
                                              det.estadoCocina === "preparacion" ? "badge-warning" : "badge-danger"
                                            }`}>
                                            {isEn && det.estadoCocina === "pendiente" ? "pending" : 
                                             isEn && det.estadoCocina === "preparacion" ? "preparing" : 
                                             isEn && det.estadoCocina === "listo" ? "ready" : det.estadoCocina}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5} className="text-center text-muted">
                                        {isEn ? "No detailed information available for this sale." : "No hay información detallada disponible para esta venta."}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>

                              <div className="details-summary-grid">
                                 <div>
                                   <span className="summary-label">Subtotal:</span>
                                   <span className="summary-value">${v.subtotal.toFixed(2)}</span>
                                 </div>
                                 <div>
                                   <span className="summary-label">{isEn ? "Taxes:" : "Impuestos:"}</span>
                                   <span className="summary-value">${v.impuestos.toFixed(2)}</span>
                                 </div>
                                 <div>
                                   <span className="summary-label">{isEn ? "Payment Method:" : "Método de Pago:"}</span>
                                   <span className="summary-value" style={{ textTransform: "capitalize", color: v.metodoPago === "efectivo" ? "var(--accent-success)" : "var(--accent-primary)" }}>
                                     {v.metodoPago ? (isEn && v.metodoPago === "efectivo" ? "cash" : isEn && v.metodoPago === "tarjeta" ? "card" : v.metodoPago) : (isEn ? "Unspecified" : "No especificado")}
                                   </span>
                                 </div>
                                {v.descuentoAplicado > 0 && (
                                  <div>
                                    <span className="summary-label text-danger">{isEn ? "Discount:" : "Descuento:"}</span>
                                    <span className="summary-value text-danger">-${v.descuentoAplicado.toFixed(2)}</span>
                                  </div>
                                )}
                                {v.propina > 0 && (
                                  <div>
                                    <span className="summary-label text-success">{isEn ? "Tip:" : "Propina:"}</span>
                                    <span className="summary-value text-success">+${v.propina.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .view-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .view-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 20px;
        }

        .page-subtitle {
          color: var(--text-muted);
          margin-top: 4px;
          font-size: 0.95rem;
        }

        .table-card {
          padding: 20px;
        }

        .main-row {
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .main-row:hover td {
          background: rgba(255, 255, 255, 0.04) !important;
        }

        .receipt-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .btn-compact {
          padding: 6px 12px;
          font-size: 0.75rem;
          gap: 4px;
        }

        .btn-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon-danger {
          color: #f87171;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
        }
        .btn-icon-danger:hover {
          background: var(--accent-danger);
          color: white;
          border-color: var(--accent-danger);
        }

        .details-row td {
          padding: 0 !important;
          background: rgba(0, 0, 0, 0.1) !important;
        }

        .details-expanded {
          margin: 16px 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .details-title {
          font-size: 0.95rem;
          color: var(--text-highlight);
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .details-table th {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .details-table td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding: 10px 12px;
          color: var(--text-main);
        }

        .details-table tr:last-child td {
          border-bottom: none;
        }

        .details-summary-grid {
          display: flex;
          justify-content: flex-end;
          gap: 24px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 14px;
          font-size: 0.85rem;
        }

        .details-summary-grid > div {
          display: flex;
          gap: 8px;
        }

        .summary-label {
          color: var(--text-muted);
        }

        .summary-value {
          font-weight: 700;
          color: var(--text-highlight);
        }

        .text-danger {
          color: #f87171;
        }
        .text-success {
          color: var(--accent-success);
        }
        .text-white {
          color: var(--text-highlight);
        }
        .font-bold {
          font-weight: 600;
        }
        .text-center {
          text-align: center;
        }
      `}</style>
    </div>
  );
};
