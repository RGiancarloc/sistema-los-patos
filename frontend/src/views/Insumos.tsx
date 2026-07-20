import React, { useState, useEffect } from "react";
import { api } from "../api";
import type { Insumo, Proveedor } from "../api";
import { Plus, Trash2, Search, Boxes, Pencil, AlertTriangle, ShoppingCart } from "lucide-react";

export const Insumos: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // CRUD Form States
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("kg");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [estado, setEstado] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInsumoId, setEditingInsumoId] = useState<number | null>(null);

  // Buy Modal States
  const [buyingInsumo, setBuyingInsumo] = useState<Insumo | null>(null);
  const [cantidadCompra, setCantidadCompra] = useState("");
  const [buyError, setBuyError] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);

  // Table category filter
  const [filterCategoria, setFilterCategoria] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [insumosList, proveedoresList] = await Promise.all([
        api.insumos.getAll(),
        api.proveedores.getAll(),
      ]);
      setInsumos(insumosList);
      setProveedores(proveedoresList);
    } catch (err: any) {
      setError(err.message || "Error al cargar datos de insumos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCancel = () => {
    setNombre("");
    setCategoria("");
    setUnidadMedida("kg");
    setStockActual("");
    setStockMinimo("");
    setCostoUnitario("");
    setProveedorId("");
    setEstado(true);
    setEditingInsumoId(null);
    setFormOpen(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !unidadMedida || stockActual === "") {
      setError("Nombre, Unidad de medida y Stock Actual son obligatorios");
      return;
    }

    const payload = {
      nombre,
      categoria: categoria || null,
      unidadMedida,
      stockActual: parseFloat(stockActual),
      stockMinimo: stockMinimo ? parseFloat(stockMinimo) : null,
      costoUnitario: costoUnitario ? parseFloat(costoUnitario) : null,
      proveedorId: proveedorId ? parseInt(proveedorId) : null,
      estado,
    };

    try {
      if (editingInsumoId !== null) {
        await api.insumos.update(editingInsumoId, payload as any);
      } else {
        await api.insumos.create(payload as any);
      }
      handleCancel();
      loadData();
    } catch (err: any) {
      setError(err.message || "Error al guardar el insumo");
    }
  };

  const handleStartEdit = (insumo: Insumo) => {
    setNombre(insumo.nombre);
    setCategoria(insumo.categoria || "");
    setUnidadMedida(insumo.unidadMedida);
    setStockActual(insumo.stockActual.toString());
    setStockMinimo(insumo.stockMinimo !== undefined && insumo.stockMinimo !== null ? insumo.stockMinimo.toString() : "");
    setCostoUnitario(insumo.costoUnitario !== undefined && insumo.costoUnitario !== null ? insumo.costoUnitario.toString() : "");
    setProveedorId(insumo.proveedorId ? insumo.proveedorId.toString() : "");
    setEstado(insumo.estado ?? true);
    setEditingInsumoId(insumo.insumoId);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este insumo?")) return;
    try {
      await api.insumos.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el insumo");
    }
  };

  const handleStartCompra = (insumo: Insumo) => {
    setBuyingInsumo(insumo);
    setCantidadCompra("");
    setBuyError("");
  };

  const handleCancelCompra = () => {
    setBuyingInsumo(null);
    setCantidadCompra("");
    setBuyError("");
  };

  const handleSubmitCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingInsumo) return;

    const qty = parseFloat(cantidadCompra);
    if (isNaN(qty) || qty <= 0) {
      setBuyError("La cantidad debe ser mayor a 0");
      return;
    }

    setBuyLoading(true);
    try {
      await api.insumos.comprar(buyingInsumo.insumoId, qty);
      handleCancelCompra();
      loadData();
    } catch (err: any) {
      setBuyError(err.message || "Error al realizar la compra");
    } finally {
      setBuyLoading(false);
    }
  };

  // Filter & Search logic
  const uniqueCategorias = Array.from(
    new Set(insumos.map((i) => i.categoria).filter(Boolean))
  ).sort() as string[];

  const filteredInsumos = insumos.filter((i) => {
    const matchesSearch =
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (i.categoria && i.categoria.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      !filterCategoria || i.categoria === filterCategoria;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in view-layout">
      <div className="view-header">
        <div>
          <h1 className="page-title">Gestión de Insumos</h1>
          <p className="page-subtitle">
            Administra el stock, costos y proveedores de las materias primas del restaurante
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (formOpen) {
              handleCancel();
            } else {
              setFormOpen(true);
            }
          }}
        >
          <Plus size={18} />
          {formOpen ? "Ocultar Formulario" : "Nuevo Insumo"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {formOpen && (
        <form onSubmit={handleSubmit} className="glass-panel form-card animate-fade-in">
          <h2 className="form-title">
            {editingInsumoId !== null ? "📝 Modificar Insumo" : "📦 Registrar Nuevo Insumo"}
          </h2>

          <div className="form-grid">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nombre del Insumo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Tomate Italiano"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Verduras, Carnes, Abarrotes"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Unidad de Medida</label>
                <select
                  className="input-field"
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  required
                >
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="g">Gramos (g)</option>
                  <option value="L">Litros (L)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unidades">Unidades</option>
                  <option value="paquetes">Paquetes</option>
                  <option value="cajas">Cajas</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Actual</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="Ej. 10.50"
                  value={stockActual}
                  onChange={(e) => setStockActual(e.target.value)}
                  required
                  disabled={editingInsumoId !== null} // En edición se incrementa usando Comprar
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Mínimo Alerta</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="Ej. 2.00"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Costo Unitario ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="Ej. 1.80"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <select
                  className="input-field"
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value)}
                >
                  <option value="">Seleccionar Proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.proveedorId} value={p.proveedorId}>
                      {p.nombre} ({p.tipoInsumo || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    id="estadoCheck"
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    checked={estado}
                    onChange={(e) => setEstado(e.target.checked)}
                  />
                  <label htmlFor="estadoCheck" style={{ color: "var(--text-main)", cursor: "pointer" }}>
                    Insumo Activo
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingInsumoId !== null ? "Guardar Cambios" : "Guardar Insumo"}
            </button>
          </div>
        </form>
      )}

      <div className="search-bar-container glass-panel">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar insumos por nombre o categoría..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="glass-panel table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Cargando listado de insumos...</span>
          </div>
        ) : insumos.length === 0 ? (
          <div className="empty-container">
            <Boxes size={48} className="empty-icon" />
            <h3>No hay insumos registrados</h3>
            <p>Registre insumos para controlar su inventario de ingredientes.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Costo Unitario</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
                <tr className="filter-row">
                  <td></td>
                  <td>
                    <select
                      className="filter-select"
                      value={filterCategoria}
                      onChange={(e) => setFilterCategoria(e.target.value)}
                    >
                      <option value="">Todas las categorías</option>
                      {uniqueCategorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {filteredInsumos.map((insumo) => {
                  const isLowStock =
                    insumo.stockMinimo !== undefined &&
                    insumo.stockMinimo !== null &&
                    insumo.stockActual <= insumo.stockMinimo;

                  return (
                    <tr key={insumo.insumoId}>
                      <td className="font-bold text-white">{insumo.nombre}</td>
                      <td>
                        {insumo.categoria ? (
                          <span className="insumos-tag">{insumo.categoria}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className={isLowStock ? "text-warning font-bold" : "text-white"}>
                            {insumo.stockActual.toFixed(2)} {insumo.unidadMedida}
                          </span>
                          {isLowStock && (
                            <span className="warning-badge" title="Stock por debajo del mínimo">
                              <AlertTriangle size={14} />
                              <span>Bajo Stock</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {insumo.stockMinimo !== undefined && insumo.stockMinimo !== null ? (
                          <span>
                            {insumo.stockMinimo.toFixed(2)} {insumo.unidadMedida}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>
                      <td className="text-success font-bold">
                        {insumo.costoUnitario !== undefined && insumo.costoUnitario !== null
                          ? `$${insumo.costoUnitario.toFixed(2)}`
                          : "-"}
                      </td>
                      <td>{insumo.proveedor ? insumo.proveedor.nombre : "-"}</td>
                      <td>
                        <span className={insumo.estado ? "status-activo" : "status-inactivo"}>
                          {insumo.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            className="btn-icon btn-icon-success"
                            onClick={() => handleStartCompra(insumo)}
                            title="Comprar insumo (abastecer)"
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-warning"
                            onClick={() => handleStartEdit(insumo)}
                            title="Modificar insumo"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleDelete(insumo.insumoId)}
                            title="Eliminar insumo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buy supplies form modal */}
      {buyingInsumo && (
        <div className="modal-overlay" onClick={handleCancelCompra}>
          <div
            className="buy-modal glass-panel animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <ShoppingCart size={20} className="text-success" />
                <h3>Comprar Insumo</h3>
              </div>
              <button className="close-btn" onClick={handleCancelCompra}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitCompra}>
              <div className="modal-body">
                {buyError && <div className="error-banner">{buyError}</div>}

                <div className="insumo-info-box">
                  <h4>{buyingInsumo.nombre}</h4>
                  <p>
                    Categoría:{" "}
                    <span className="text-white">{buyingInsumo.categoria || "Sin categoría"}</span>
                  </p>
                  <p>
                    Stock Actual:{" "}
                    <span className="text-white">
                      {buyingInsumo.stockActual.toFixed(2)} {buyingInsumo.unidadMedida}
                    </span>
                  </p>
                  {buyingInsumo.proveedor && (
                    <p>
                      Proveedor:{" "}
                      <span className="text-white">{buyingInsumo.proveedor.nombre}</span>
                    </p>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: "16px" }}>
                  <label className="form-label">Cantidad a Comprar ({buyingInsumo.unidadMedida})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-field"
                    placeholder="Ej. 12.50"
                    value={cantidadCompra}
                    onChange={(e) => setCantidadCompra(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {cantidadCompra && !isNaN(parseFloat(cantidadCompra)) && parseFloat(cantidadCompra) > 0 && (
                  <div className="stock-preview-box">
                    <span>Nuevo Stock Estimado:</span>
                    <strong className="text-success" style={{ marginLeft: "8px" }}>
                      {(buyingInsumo.stockActual + parseFloat(cantidadCompra)).toFixed(2)}{" "}
                      {buyingInsumo.unidadMedida}
                    </strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelCompra}
                  disabled={buyLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={buyLoading}
                >
                  {buyLoading ? "Procesando..." : "Confirmar Compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .insumos-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .text-warning {
          color: var(--accent-warning);
        }

        .warning-badge {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #f59e0b;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .status-activo {
          color: var(--accent-success);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-inactivo {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .btn-icon-success {
          color: #34d399;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .btn-icon-success:hover {
          background: var(--accent-success);
          color: white;
          border-color: var(--accent-success);
        }

        .btn-icon-warning {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
        }

        .btn-icon-warning:hover {
          background: var(--accent-warning);
          color: white;
          border-color: var(--accent-warning);
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

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .buy-modal {
          width: 90%;
          max-width: 460px;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title-group h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-highlight);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-highlight);
        }

        .insumo-info-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .insumo-info-box h4 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          color: var(--text-highlight);
        }

        .insumo-info-box p {
          margin: 5px 0;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .stock-preview-box {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 8px;
          padding: 12px;
          margin-top: 14px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--card-border);
          padding-top: 16px;
          margin-top: 20px;
        }

        .text-white {
          color: var(--text-highlight);
        }

        .font-bold {
          font-weight: 600;
        }

        .text-success {
          color: var(--accent-success);
        }

        .filter-row td {
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.01);
          border-bottom: 1px solid var(--card-border);
        }

        .filter-select {
          width: 100%;
          background: #ffffff;
          border: 1px solid var(--card-border);
          border-radius: 6px;
          padding: 6px 12px;
          color: var(--text-main);
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
