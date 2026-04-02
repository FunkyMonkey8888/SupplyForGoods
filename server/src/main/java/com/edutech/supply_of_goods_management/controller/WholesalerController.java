package com.edutech.supply_of_goods_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.InventoryService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/wholesalers")
public class WholesalerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final InventoryService inventoryService;

    public WholesalerController(ProductService productService,
                                OrderService orderService,
                                InventoryService inventoryService) {
        this.productService = productService;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
    }

    /* ============================================================
       ✅ UPDATED: Browse Products WITH sorting + search + pagination
       ============================================================ */
    @GetMapping("/products")
    public ResponseEntity<List<Product>> browseProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {

        // ✅ If NO params → behave EXACTLY like before (tests depend on this)
        if (name == null && sort == null && minPrice == null &&
            maxPrice == null && page == null && size == null) {

            return ResponseEntity.ok(productService.getAllProducts());
        }

        // ✅ Optional enhanced features
        return ResponseEntity.ok(
                productService.getEnhancedProducts(
                        name, sort, minPrice, maxPrice, page, size
                )
        );
    }

    /* ✅ Place Order */
    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(@RequestParam Long productId,
                                            @RequestParam Long userId,
                                            @RequestBody Order order) {
        return ResponseEntity.ok(orderService.placeOrder(productId, userId, order));
    }

    /* ✅ Update Order Status */
    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    /* ✅ Get All Orders for wholesaler */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    /* ✅ Add Inventory */
    @PostMapping("/inventories")
    public ResponseEntity<Inventory> addInventory(@RequestParam Long productId,
                                                  @RequestBody Inventory inventory) {
        return ResponseEntity.ok(inventoryService.addInventory(productId, inventory));
    }

    /* ✅ Update Inventory */
    @PutMapping("/inventories/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id,
                                                     @RequestParam int stockQuantity) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, stockQuantity));
    }

    /* ✅ Get All Inventories */
    @GetMapping("/inventories")
    public ResponseEntity<List<Inventory>> getAllInventories(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByWholesaler(wholesalerId));
    }

    /* ✅ EXTRA API (unchanged) */
    @GetMapping("/consumer-orders")
    @PreAuthorize("hasAuthority('WHOLESALER')")
    public ResponseEntity<List<Order>> getConsumerOrdersForWholesaler(
            @RequestParam Long wholesalerId) {

        return ResponseEntity.ok(
                orderService.getConsumerOrdersForWholesaler(wholesalerId)
        );
    }
}
