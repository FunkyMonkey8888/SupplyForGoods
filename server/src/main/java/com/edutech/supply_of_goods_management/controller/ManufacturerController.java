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

    /* ===================== PRODUCTS ===================== */

    @PostMapping("/product")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody Product productDetails) {
        return ResponseEntity.ok(productService.updateProduct(id, productDetails));
    }

    @GetMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/products")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> getManufacturerProducts(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(productService.getProductsByManufacturer(manufacturerId));
    }

    @GetMapping("/products/search")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    @GetMapping("/products/low-stock")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> lowStockForManufacturer(@RequestParam Long manufacturerId,
                                                                 @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(productService.getLowStockProductsByManufacturer(manufacturerId, threshold));
    }

    /**
     * ✅ Delete product only if there are NO WHOLESALER orders for that product.
     * This supports your View Products UI delete restriction.
     */
    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProductIfNoWholesalerOrders(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ UI support: return wholesaler order count for a given product
     */
    @GetMapping("/products/{productId}/wholesaler-orders/count")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Long> wholesalerOrdersCount(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.countWholesalerOrdersForProduct(productId));
    }

    /**
     * ✅ UI support: return whether product can be deleted
     */
    @GetMapping("/products/{productId}/can-delete")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Boolean> canDelete(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.countWholesalerOrdersForProduct(productId) == 0);
    }

    /* ===================== ORDERS ===================== */

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersForManufacturer(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(orderService.getOrdersByManufacturer(manufacturerId));
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @GetMapping("/orders/status")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersForManufacturerByStatus(@RequestParam Long manufacturerId,
                                                                        @RequestParam String status) {
        return ResponseEntity.ok(orderService.getOrdersByManufacturerAndStatus(manufacturerId, status));
    }

    @GetMapping("/orders/product/{productId}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.getOrdersByProduct(productId));
    }

    @PutMapping("/orders/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PatchMapping("/orders/{id}/cancel")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}