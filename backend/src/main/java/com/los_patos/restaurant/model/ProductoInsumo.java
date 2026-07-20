package com.los_patos.restaurant.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "producto_insumo")
@IdClass(ProductoInsumoKey.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoInsumo {
    @Id
    @Column(name = "producto_id")
    private Integer productoId;

    @Id
    @Column(name = "insumo_id")
    private Integer insumoId;

    @Column(name = "cantidad_necesaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadNecesaria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "insumo_id", insertable = false, updatable = false)
    private Insumo insumo;
}
