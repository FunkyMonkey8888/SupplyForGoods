package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    private final ProductService productService;
    private final OrderService orderService;

    public ManufacturerController(ProductService productService,
                                  OrderService orderService) {
        this.productService = productService;
        this.orderService = orderService;
    }


    @PostMapping("/product")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product) {

        return ResponseEntity.ok(
                productService.createProduct(product)
        );
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        return ResponseEntity.ok(
                productService.updateProduct(id, productDetails)
        );
    }

    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> getManufacturerProducts(
            @RequestParam Long manufacturerId) {

        return ResponseEntity.ok(
                productService.getProductsByManufacturer(manufacturerId)
        );
    }


    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersForManufacturer(
            @RequestParam Long manufacturerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByManufacturer(manufacturerId)
        );
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}