package com.los_patos.restaurant.repository;

import com.los_patos.restaurant.model.ProductoInsumo;
import com.los_patos.restaurant.model.ProductoInsumoKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoInsumoRepository extends JpaRepository<ProductoInsumo, ProductoInsumoKey> {
    List<ProductoInsumo> findByProductoId(Integer productoId);
}
