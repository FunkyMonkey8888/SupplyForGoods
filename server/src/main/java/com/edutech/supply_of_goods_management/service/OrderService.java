package com.edutech.supply_of_goods_management.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.OrderStateMachine;
import com.edutech.supply_of_goods_management.entity.OrderStatus;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import java.util.List;
import java.util.Optional;
// OrderService.java

import javax.transaction.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepo, ProductRepository productRepo, UserRepository userRepo, InventoryService invenRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.inventoryService = invenRepo;
    }

    public Order placeOrder(Long productId, Long userId, Order order) {
        Product p = productRepo.findById(productId).orElseThrow();
        User u = userRepo.findById(userId).orElseThrow();
        order.setProduct(p);
        order.setUser(u);
        order.setStatus(OrderStatus.PLACED);
        return orderRepo.save(order);
    }

@Transactional
public Order updateOrderStatus(Long orderId, OrderStatus status) {

    Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    OrderStatus currentStatus = order.getStatus();

    if (!OrderStateMachine.isValidTransition(currentStatus, status)) {
        throw new IllegalStateException(
                "Invalid order status transition from "
                + currentStatus + " to " + status
        );
    }

    // Business-specific logic
    if (status == OrderStatus.CONFIRMED) {
        inventoryService.reserveInventory(order);
    }

    if (status == OrderStatus.CANCELLED) {
        inventoryService.releaseInventory(order);
    }

    order.setStatus(status);
    return orderRepo.save(order);
}


    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }
}