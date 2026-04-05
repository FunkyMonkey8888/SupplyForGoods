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
}