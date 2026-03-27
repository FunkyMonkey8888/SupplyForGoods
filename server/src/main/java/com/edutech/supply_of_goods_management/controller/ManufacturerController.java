package com.edutech.supply_of_goods_management.controller;

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

    // ✅ Create Product
    @PostMapping("/product")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    // ✅ Update Product
    @PutMapping("/product/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody Product productDetails) {
        return ResponseEntity.ok(productService.updateProduct(id, productDetails));
    }

    // ✅ Get All Products by Manufacturer
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProductsOfManufacturer(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(productService.getProductsByManufacturer(manufacturerId));
    }
}