package com.edutech.supply_of_goods_management.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    public WholesalerController(ProductService productService, OrderService orderService, InventoryService inventoryService) {
        this.productService = productService;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
    }

    @GetMapping("/products")
    public List<Product> browseProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/order")
    public Order placeOrder(@RequestParam Long productId,
                            @RequestParam Long userId,
                            @RequestBody Order order) {
        return orderService.placeOrder(productId, userId, order);
    }

    @PutMapping("/order/{id}")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @GetMapping("/orders")
    public List<Order> getOrders(@RequestParam Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @PostMapping("/inventories")
    public Inventory addInventory(@RequestParam Long productId, @RequestBody Inventory inventory) {
        return inventoryService.addInventory(productId, inventory);
    }

    @PutMapping("/inventories/{id}")
    public Inventory updateInventory(@PathVariable Long id, @RequestParam int stockQuantity) {
        return inventoryService.updateInventory(id, stockQuantity);
    }

    @GetMapping("/inventories")
    public List<Inventory> getInventories(@RequestParam Long wholesalerId) {
        return inventoryService.getInventoriesByWholesaler(wholesalerId);
    }
}
