package com.pwa.localshop.controller;

import com.pwa.localshop.repository.ProductoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("productos", productoRepository.findAll());
        return "index"; // Renderiza la vista index.html (SSR con Thymeleaf)
    }
}
