package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Handles all Manufacturer operations like creating products
 * and viewing wholesaler orders. Only MANUFACTURER can access.
 */
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

    /**
     * Create a new product.
     */
    @PostMapping("/product")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    /**
     * Update product details using product ID.
     */
    @PutMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody Product productDetails) {
        return ResponseEntity.ok(productService.updateProduct(id, productDetails));
    }

    /**
     * Get a single product using its ID.
     */
    @GetMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Get all products created by a manufacturer.
     */
    @GetMapping("/products")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> getManufacturerProducts(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(productService.getProductsByManufacturer(manufacturerId));
    }

    /**
     * Search products by name or keyword.
     */
    @GetMapping("/products/search")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    /**
     * Get products whose stock is below a threshold (default: 10).
     */
    @GetMapping("/products/low-stock")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Product>> lowStockForManufacturer(@RequestParam Long manufacturerId,
                                                                 @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(productService.getLowStockProductsByManufacturer(manufacturerId, threshold));
    }

    /**
     * Delete a product only if no wholesaler has ordered it.
     */
    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProductIfNoWholesalerOrders(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get the number of wholesaler orders for a product.
     */
    @GetMapping("/products/{productId}/wholesaler-orders/count")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Long> wholesalerOrdersCount(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.countWholesalerOrdersForProduct(productId));
    }

    /**
     * Check whether a product is allowed to be deleted.
     */
    @GetMapping("/products/{productId}/can-delete")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Boolean> canDelete(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.countWholesalerOrdersForProduct(productId) == 0);
    }

    /* ===================== ORDERS ===================== */

    /**
     * Get all wholesaler orders for this manufacturer.
     */
    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersForManufacturer(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(orderService.getOrdersByManufacturer(manufacturerId));
    }

    /**
     * Get a single order using its ID.
     */
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    /**
     * Get orders filtered by status (e.g., PENDING, CONFIRMED).
     */
    @GetMapping("/orders/status")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersForManufacturerByStatus(@RequestParam Long manufacturerId,
                                                                        @RequestParam String status) {
        return ResponseEntity.ok(orderService.getOrdersByManufacturerAndStatus(manufacturerId, status));
    }

    /**
     * Get all orders placed for a particular product.
     */
    @GetMapping("/orders/product/{productId}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<List<Order>> getOrdersByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(orderService.getOrdersByProduct(productId));
    }

    /**
     * Update the status of an order (like CONFIRMED or SHIPPED).
     */
    @PutMapping("/orders/{id}")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    /**
     * Cancel an order (partial update using PATCH).
     */
    @PatchMapping("/orders/{id}/cancel")
    @PreAuthorize("hasAuthority('MANUFACTURER')")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}