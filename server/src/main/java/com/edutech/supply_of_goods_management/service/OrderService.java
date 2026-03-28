
package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo,
                        InventoryService inventoryService) {

        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.inventoryService = inventoryService;
    }

    /* ---------------- PLACE ORDER ---------------- */

    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        order.setProduct(product);
        order.setUser(user);

        // ✅ Tests expect initial status as STRING
        order.setStatus("PENDING");

        return orderRepo.save(order);
    }

    /* ---------------- UPDATE ORDER STATUS ---------------- */

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String currentStatus = order.getStatus();

        if (currentStatus == null || currentStatus.isBlank()) {
            throw new IllegalStateException("Order status is not initialized");
        }

        newStatus = newStatus.toUpperCase();

        // ✅ Basic allowed transitions (aligned with tests)
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    "Invalid order status transition from "
                            + currentStatus + " to " + newStatus
            );
        }

        // ✅ Inventory hooks
        if ("CONFIRMED".equals(newStatus)) {
            inventoryService.reserveInventory(order);
        }

        if ("CANCELLED".equals(newStatus)) {
            inventoryService.releaseInventory(order);
        }

        order.setStatus(newStatus);
        return orderRepo.save(order);
    }

    

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    /* ---------------- TRANSITION RULES ---------------- */

    private boolean isValidTransition(String current, String next) {

        switch (current) {
            case "PENDING":
            case "PLACED":
                return next.equals("CONFIRMED")
                        || next.equals("SHIPPED")
                        || next.equals("CANCELLED");

            case "CONFIRMED":
                return next.equals("SHIPPED")
                        || next.equals("CANCELLED");

            case "SHIPPED":
                return next.equals("DELIVERED");

            case "DELIVERED":
            case "CANCELLED":
                return false;

            default:
                return false;
        }
    }
}