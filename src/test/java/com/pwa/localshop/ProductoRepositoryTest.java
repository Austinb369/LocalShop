package com.pwa.localshop;

import com.pwa.localshop.model.Producto;
import com.pwa.localshop.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void deberiaGuardarYRecuperarProducto() {
        // Arrange
        Producto producto = new Producto(null, "Test Producto", "Descripción de prueba", 99.99, "/img/test.png");

        // Act
        Producto guardado = productoRepository.save(producto);
        List<Producto> todos = productoRepository.findAll();

        // Assert
        assertThat(guardado.getId()).isNotNull();
        assertThat(todos).hasSizeGreaterThan(0);
        assertThat(todos.stream().anyMatch(p -> "Test Producto".equals(p.getNombre()))).isTrue();
    }
}
