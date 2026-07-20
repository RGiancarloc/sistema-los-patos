package com.los_patos.restaurant.controller;

import com.los_patos.restaurant.model.Insumo;
import com.los_patos.restaurant.model.Proveedor;
import com.los_patos.restaurant.repository.InsumoRepository;
import com.los_patos.restaurant.repository.ProveedorRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Data
    public static class InsumoDto {
        private String nombre;
        private String categoria;
        private String unidadMedida;
        private BigDecimal stockActual;
        private BigDecimal stockMinimo;
        private BigDecimal costoUnitario;
        private Integer proveedorId;
        private Boolean estado;
    }

    @Data
    public static class CompraDto {
        private BigDecimal cantidad;
    }

    @GetMapping("/")
    public ResponseEntity<List<Insumo>> getInsumos(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(insumoRepository.searchInsumos(search));
        }
        return ResponseEntity.ok(insumoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInsumo(@PathVariable("id") Integer id) {
        Optional<Insumo> opt = insumoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapError("Insumo no encontrado"));
        }
        return ResponseEntity.ok(opt.get());
    }

    @PostMapping("/")
    public ResponseEntity<Insumo> createInsumo(@RequestBody InsumoDto dto) {
        Insumo insumo = new Insumo();
        copyDtoToEntity(dto, insumo);
        Insumo saved = insumoRepository.save(insumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInsumo(@PathVariable("id") Integer id, @RequestBody InsumoDto dto) {
        Optional<Insumo> opt = insumoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapError("Insumo no encontrado"));
        }
        Insumo insumo = opt.get();
        copyDtoToEntity(dto, insumo);
        Insumo updated = insumoRepository.save(insumo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInsumo(@PathVariable("id") Integer id) {
        Optional<Insumo> opt = insumoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapError("Insumo no encontrado"));
        }
        insumoRepository.delete(opt.get());
        Map<String, String> res = new HashMap<>();
        res.put("message", "Insumo eliminado exitosamente");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/comprar")
    public ResponseEntity<?> comprarInsumo(@PathVariable("id") Integer id, @RequestBody CompraDto dto) {
        Optional<Insumo> opt = insumoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapError("Insumo no encontrado"));
        }
        if (dto.getCantidad() == null || dto.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(mapError("La cantidad debe ser mayor a cero"));
        }
        Insumo insumo = opt.get();
        if (insumo.getStockActual() == null) {
            insumo.setStockActual(BigDecimal.ZERO);
        }
        insumo.setStockActual(insumo.getStockActual().add(dto.getCantidad()));
        Insumo updated = insumoRepository.save(insumo);
        return ResponseEntity.ok(updated);
    }

    private void copyDtoToEntity(InsumoDto dto, Insumo insumo) {
        insumo.setNombre(dto.getNombre());
        insumo.setCategoria(dto.getCategoria());
        insumo.setUnidadMedida(dto.getUnidadMedida());
        if (dto.getStockActual() != null) {
            insumo.setStockActual(dto.getStockActual());
        } else if (insumo.getStockActual() == null) {
            insumo.setStockActual(BigDecimal.ZERO);
        }
        insumo.setStockMinimo(dto.getStockMinimo());
        insumo.setCostoUnitario(dto.getCostoUnitario());
        insumo.setEstado(dto.getEstado() == null ? true : dto.getEstado());

        if (dto.getProveedorId() != null) {
            Proveedor prov = proveedorRepository.findById(dto.getProveedorId()).orElse(null);
            insumo.setProveedor(prov);
        } else {
            insumo.setProveedor(null);
        }
    }

    private Map<String, String> mapError(String msg) {
        Map<String, String> err = new HashMap<>();
        err.put("detail", msg);
        return err;
    }
}
