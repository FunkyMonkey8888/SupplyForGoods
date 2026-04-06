package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.edutech.supply_of_goods_management.service.NotificationService;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

// Service class for order-related operations
@Service
public class OrderService {

    // Repository and service dependencies
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;
    private final NotificationService notificationService;

    // Constructor-based dependency injection
    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo,
                        InventoryService inventoryService, 
                    InventoryRepository ir, 
                        NotificationService ns) {

        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.inventoryService = inventoryService;
        this.inventoryRepository = ir;
        this.notificationService = ns;
    }

    // Place a new order
    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("PENDING");

        // Notify manufacturer of product demand
notificationService.notifyUser(
    product.getManufacturerId(),
    "MANUFACTURER",
    "New Order Placed",
    "A new order was placed for: " + product.getName()
);

// Notify wholesaler(s) who handle this product
List<Inventory> invs = inventoryRepository.findByProductId(product.getId());
for (Inventory inv : invs) {
    notificationService.notifyUser(
        inv.getWholesalerId(),
        "WHOLESALER",
        "New Consumer Order",
        "New consumer order for: " + product.getName()
    );
}



        return orderRepo.save(order);
    }

    // Update order status
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Reserve inventory if order is confirmed
        if ("CONFIRMED".equals(status)) {
            try {
                inventoryService.reserveInventory(order);
            } catch (RuntimeException ex) {

                // If inventory fails, delete the product
                Product product = order.getProduct();
                productRepo.deleteById(product.getId());

                throw new RuntimeException(
                        "Inventory unavailable. Product has been removed."
                );
            }
        }

        order.setStatus(status);
        return orderRepo.save(order);
    }

    // Get orders by user ID
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    // Get orders for manufacturer
    public List<Order> getOrdersByManufacturer(Long manufacturerId) {
        return orderRepo.findByProductManufacturerIdAndUserRole(manufacturerId, "WHOLESALER");
    }

    // Check valid order status transitions
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

    // Get consumer orders for wholesaler
    public List<Order> getConsumerOrdersForWholesaler(Long wholesalerId) {

        // Fetch inventories of wholesaler
        List<Inventory> inventories =
                inventoryRepository.findByWholesalerId(wholesalerId);

        // Extract product IDs
        List<Long> productIds = inventories.stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return List.of();
        }

        return orderRepo.findByProductIdInAndUserRole(
                productIds, "CONSUMER"
        );
    }

    public Order getOrderById(Long orderId) {
    return orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
}

public List<Order> getOrdersByUserAndStatus(Long userId, String status) {
    if (status == null || status.trim().isEmpty()) return List.of();
    return orderRepo.findByUserIdAndStatus(userId, status.trim().toUpperCase());
}

public List<Order> getOrdersByManufacturerAndStatus(Long manufacturerId, String status) {
    if (status == null || status.trim().isEmpty()) return List.of();
    return orderRepo.findByProductManufacturerIdAndUserRoleAndStatus(
            manufacturerId, "WHOLESALER", status.trim().toUpperCase()
    );
}

public List<Order> getOrdersByProduct(Long productId) {
    return orderRepo.findByProductId(productId);
}

@Transactional
public Order cancelOrder(Long orderId) {
    Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    String current = order.getStatus() == null ? "PENDING" : order.getStatus().trim().toUpperCase();

    if ("DELIVERED".equals(current) || "CANCELLED".equals(current)) {
        throw new IllegalStateException("Cannot cancel an order in status: " + current);
    }

    if ("CONFIRMED".equals(current)) {
        inventoryService.releaseReservedInventory(order);
    }

    order.setStatus("CANCELLED");
    return orderRepo.save(order);
}

public List<Order> getConsumerOrdersForWholesalerByStatus(Long wholesalerId, String status) {
    if (status == null || status.trim().isEmpty()) return List.of();
    return orderRepo.findByProductIdInAndUserRoleAndStatus(
            inventoryRepository.findByWholesalerId(wholesalerId).stream()
                    .map(inv -> inv.getProduct().getId())
                    .distinct()
                    .collect(java.util.stream.Collectors.toList()),
            "CONSUMER",
            status.trim().toUpperCase()
    );
}
}
