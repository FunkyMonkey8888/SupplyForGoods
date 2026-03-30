package com.edutech.supply_of_goods_management.service;

<<<<<<< HEAD
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

=======
import com.edutech.supply_of_goods_management.entity.Inventory;
>>>>>>> feature/updated-frontend
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo,
                        InventoryService inventoryService, 
                    InventoryRepository ir) {

        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.inventoryService = inventoryService;
        this.inventoryRepository = ir;
    }


    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        order.setProduct(product);
        order.setUser(user);

        order.setStatus("PENDING");



        return orderRepo.save(order);
    }


    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String currentStatus = order.getStatus();

        if (currentStatus == null || currentStatus.isBlank()) {
            throw new IllegalStateException("Order status is not initialized");
        }

        newStatus = newStatus.toUpperCase();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    "Invalid order status transition from " +
                            currentStatus + " to " + newStatus
            );
        }

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

<<<<<<< HEAD
=======
    public List<Order> getOrdersByManufacturer(Long manufacturerId) {
        return orderRepo.findByProductManufacturerId(manufacturerId);
    }

>>>>>>> feature/updated-frontend

    private boolean isValidTransition(String current, String next) {

        switch (current) {
            case "PENDING":
                return next.equals("CONFIRMED") || next.equals("CANCELLED") || next.equals("SHIPPED");

            case "CONFIRMED":
                return next.equals("SHIPPED") || next.equals("CANCELLED");

            case "SHIPPED":
                return next.equals("DELIVERED");

            case "DELIVERED":
            case "CANCELLED":
                return false;

            default:
                return false;
        }
    }

<<<<<<< HEAD


@Transactional
@PreAuthorize("hasAnyAuthority('WHOLESALER', 'MANUFACTURER')")
public void deleteOrder(Long orderId) {

    Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    String status = order.getStatus();

    
    if ("CONFIRMED".equals(status)) {
        inventoryService.releaseInventory(order);
    }

    orderRepo.delete(order);
}


=======
    public List<Order> getConsumerOrdersForWholesaler(Long wholesalerId) {

    // Step 1: get all inventories of the wholesaler
    List<Inventory> inventories =
            inventoryRepository.findByWholesalerId(wholesalerId);

    // Step 2: extract product IDs
    List<Long> productIds = inventories.stream()
            .map(inv -> inv.getProduct().getId())
            .distinct().collect(Collectors.toList());

    if (productIds.isEmpty()) {
        return List.of();
    }

    return orderRepo.findByProductIdInAndUserRole(
            productIds, "CONSUMER"
    );
}
>>>>>>> feature/updated-frontend
}