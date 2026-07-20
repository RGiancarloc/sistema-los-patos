package com.los_patos.restaurant.model;

import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoInsumoKey implements Serializable {
    private Integer productoId;
    private Integer insumoId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductoInsumoKey that = (ProductoInsumoKey) o;
        return Objects.equals(productoId, that.productoId) &&
               Objects.equals(insumoId, that.insumoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productoId, insumoId);
    }
}
