package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    private final ProductService productService;

    public ManufacturerController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/product")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/product/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productService.updateProduct(id, updatedProduct);
    }

    @GetMapping("/products")
    public List<Product> getProducts(@RequestParam Long manufacturerId) {
        return productService.getProductsByManufacturer(manufacturerId);
    }
}
