package com.los_patos.restaurant.repository;

import com.los_patos.restaurant.model.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InsumoRepository extends JpaRepository<Insumo, Integer> {
    @Query("SELECT i FROM Insumo i WHERE LOWER(i.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.categoria) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Insumo> searchInsumos(@Param("search") String search);
}
