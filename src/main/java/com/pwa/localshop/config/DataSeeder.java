package com.pwa.localshop.config;

import com.pwa.localshop.model.Producto;
import com.pwa.localshop.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Inicializa la base de datos con datos de ejemplo al arrancar la aplicación.
 * Solo se ejecuta si la tabla de productos está vacía.
 */
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedDatabase(ProductoRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.saveAll(List.of(
                    new Producto(null, "Laptop UltraBook Pro",
                        "Procesador Intel Core i7, 16GB RAM, SSD 512GB, pantalla 15.6\" FHD.",
                        18999.99, "/images/products/laptop.svg"),
                    new Producto(null, "Smartphone Galaxy Z",
                        "Pantalla AMOLED 6.7\", 5G, cámara 108MP, batería 5000mAh.",
                        12499.00, "/images/products/smartphone.svg"),
                    new Producto(null, "Audífonos Wireless Pro",
                        "Cancelación activa de ruido, 30h de batería, conexión Bluetooth 5.3.",
                        2299.50, "/images/products/headphones.svg"),
                    new Producto(null, "Smartwatch Active 4",
                        "Monitoreo cardíaco 24/7, GPS integrado, resistente al agua IP68.",
                        3499.00, "/images/products/smartwatch.svg"),
                    new Producto(null, "Teclado Mecánico RGB",
                        "Switches Cherry MX Red, retroiluminación RGB, anti-ghosting completo.",
                        1899.99, "/images/products/keyboard.svg"),
                    new Producto(null, "Monitor Curvo 27\"",
                        "Resolución QHD 2560x1440, panel IPS, 165Hz, tiempo de respuesta 1ms.",
                        6799.00, "/images/products/monitor.svg")
                ));
                System.out.println("[DataSeeder] ✅ 6 productos de ejemplo cargados en la base de datos.");
            }
        };
    }
}
