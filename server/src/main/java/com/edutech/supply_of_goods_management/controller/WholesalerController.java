package com.edutech.supply_of_goods_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.OrderStatus;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.InventoryService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

// REST controller for wholesaler operations
@RestController
@RequestMapping("/api/wholesalers")
public class WholesalerController {

    // Service dependencies
    private final ProductService productService;
    private final OrderService orderService;
    private final InventoryService inventoryService;

    // Constructor-based dependency injection
    public WholesalerController(ProductService productService,
                                OrderService orderService,
                                InventoryService inventoryService) {
        this.productService = productService;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
    }

    // View all available products
    @GetMapping("/products")
    public ResponseEntity<List<Product>> browseProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Place a new order
    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(@RequestParam Long productId,
                                            @RequestParam Long userId,
                                            @RequestBody Order order) {
        return ResponseEntity.ok(orderService.placeOrder(productId, userId, order));
    }

    // Update order status
    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // Get all orders of the wholesaler
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // Add inventory details
    @PostMapping("/inventories")
    public ResponseEntity<Inventory> addInventory(@RequestParam Long productId,
                                                  @RequestBody Inventory inventory) {
        return ResponseEntity.ok(inventoryService.addInventory(productId, inventory));
    }

    // Update inventory stock
    @PutMapping("/inventories/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id,
                                                     @RequestParam int stockQuantity) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, stockQuantity));
    }

    // Get all inventories of the wholesaler
    @GetMapping("/inventories")
    public ResponseEntity<List<Inventory>> getAllInventories(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByWholesaler(wholesalerId));
    }

    // Get consumer orders for wholesaler
    @GetMapping("/consumer-orders")
    @PreAuthorize("hasAuthority('WHOLESALER')")
    public ResponseEntity<List<Order>> getConsumerOrdersForWholesaler(
            @RequestParam Long wholesalerId) {

        return ResponseEntity.ok(
                orderService.getConsumerOrdersForWholesaler(wholesalerId)
        );
    }

    @GetMapping("/products/{id}")
public ResponseEntity<Product> getProduct(@PathVariable Long id) {
    return ResponseEntity.ok(productService.getProductById(id));
}

@GetMapping("/products/search")
public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
    return ResponseEntity.ok(productService.searchProducts(query));
}

@GetMapping("/products/low-stock")
public ResponseEntity<List<Product>> lowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
    return ResponseEntity.ok(productService.getLowStockProducts(threshold));
}

@PatchMapping("/order/{id}/cancel")
public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
    return ResponseEntity.ok(orderService.cancelOrder(id));
}

@GetMapping("/orders/{orderId}")
public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
    return ResponseEntity.ok(orderService.getOrderById(orderId));
}

@GetMapping("/orders/status")
public ResponseEntity<List<Order>> getAllOrdersByStatus(@RequestParam Long userId,
                                                       @RequestParam String status) {
    return ResponseEntity.ok(orderService.getOrdersByUserAndStatus(userId, status));
}

@PostMapping("/inventories/{id}/restock")
public ResponseEntity<Inventory> restockInventory(@PathVariable Long id,
                                                  @RequestParam int qty) {
    return ResponseEntity.ok(inventoryService.restockInventory(id, qty));
}

@GetMapping("/inventories/{id}")
public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
    return ResponseEntity.ok(inventoryService.getInventoryById(id));
}

@GetMapping("/inventories/by-product")
public ResponseEntity<Inventory> getInventoryByProduct(@RequestParam Long wholesalerId,
                                                       @RequestParam Long productId) {
    return ResponseEntity.ok(inventoryService.getInventoryByWholesalerAndProduct(wholesalerId, productId));
}

@GetMapping("/inventories/low-stock")
public ResponseEntity<List<Inventory>> getLowStockInventories(@RequestParam Long wholesalerId,
                                                              @RequestParam(defaultValue = "10") int threshold) {
    return ResponseEntity.ok(inventoryService.getLowStockInventoriesByWholesaler(wholesalerId, threshold));
}

@GetMapping("/consumer-orders/status")
@PreAuthorize("hasAuthority('WHOLESALER')")
public ResponseEntity<List<Order>> getConsumerOrdersForWholesalerByStatus(
        @RequestParam Long wholesalerId,
        @RequestParam String status) {
    return ResponseEntity.ok(orderService.getConsumerOrdersForWholesalerByStatus(wholesalerId, status));
}

}