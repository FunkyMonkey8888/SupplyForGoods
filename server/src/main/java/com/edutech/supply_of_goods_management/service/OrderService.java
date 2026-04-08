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

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service handling all order-related operations such as placing,
 * updating, canceling orders and sending notifications.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;
    private final NotificationService notificationService;

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

    /**
     * Create a new order for a product and notify manufacturer & wholesaler(s).
     */
    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("PENDING"); // all new orders start as PENDING

        // Notify the manufacturer about the new order
        notificationService.notifyUser(
                product.getManufacturerId(),
                "MANUFACTURER",
                "New Order Placed",
                "A new order was placed for: " + product.getName()
        );

        // Notify all wholesalers who stock this product
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

    /**
     * Update the status of an order (CONFIRMED, SHIPPED, etc.).
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // If confirming order, reserve stock first
        if ("CONFIRMED".equals(status)) {
            try {
                inventoryService.reserveInventory(order);
            } catch (RuntimeException ex) {
                // If reserve fails, remove product completely
                Product product = order.getProduct();
                productRepo.deleteById(product.getId());
                throw new RuntimeException("Inventory unavailable. Product has been removed.");
            }
        }

        order.setStatus(status);
        return orderRepo.save(order);
    }

    /**
     * Get all orders placed by a particular user.
     */
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    /**
     * Get all orders wholesalers placed to this manufacturer.
     */
    public List<Order> getOrdersByManufacturer(Long manufacturerId) {
        return orderRepo.findByProductManufacturerIdAndUserRole(manufacturerId, "WHOLESALER");
    }

    /**
     * Validate allowed status changes for orders.
     */
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

    /**
     * Get all consumer orders handled by the wholesaler.
     */
    public List<Order> getConsumerOrdersForWholesaler(Long wholesalerId) {

        // Get wholesaler's inventory items
        List<Inventory> inventories = inventoryRepository.findByWholesalerId(wholesalerId);

        // Extract related product IDs
        List<Long> productIds = inventories.stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        if (productIds.isEmpty()) return List.of();

        return orderRepo.findByProductIdInAndUserRole(productIds, "CONSUMER");
    }

    /**
     * Get order by its ID.
     */
    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    /**
     * Get orders for a user filtered by status.
     */
    public List<Order> getOrdersByUserAndStatus(Long userId, String status) {
        if (status == null || status.trim().isEmpty()) return List.of();
        return orderRepo.findByUserIdAndStatus(userId, status.trim().toUpperCase());
    }

    /**
     * Get manufacturer orders filtered by status.
     */
    public List<Order> getOrdersByManufacturerAndStatus(Long manufacturerId, String status) {
        if (status == null || status.trim().isEmpty()) return List.of();
        return orderRepo.findByProductManufacturerIdAndUserRoleAndStatus(
                manufacturerId, "WHOLESALER", status.trim().toUpperCase()
        );
    }

    /**
     * Get all wholesaler orders for a product.
     */
    public List<Order> getOrdersByProduct(Long productId) {
        return orderRepo.findByProductId(productId);
    }

    /**
     * Cancel an order (only allowed for certain statuses).
     */
    @Transactional
    public Order cancelOrder(Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String current = order.getStatus() == null ? "PENDING" :
                order.getStatus().trim().toUpperCase();

        // Cannot cancel delivered or already cancelled orders
        if ("DELIVERED".equals(current) || "CANCELLED".equals(current)) {
            throw new IllegalStateException("Cannot cancel an order in status: " + current);
        }

        // Release stock if order was already confirmed
        if ("CONFIRMED".equals(current)) {
            inventoryService.releaseReservedInventory(order);
        }

        order.setStatus("CANCELLED");
        return orderRepo.save(order);
    }

    /**
     * Get consumer orders for wholesaler filtered by status.
     */
    public List<Order> getConsumerOrdersForWholesalerByStatus(Long wholesalerId, String status) {

        if (status == null || status.trim().isEmpty()) return List.of();

        return orderRepo.findByProductIdInAndUserRoleAndStatus(
                inventoryRepository.findByWholesalerId(wholesalerId).stream()
                        .map(inv -> inv.getProduct().getId())
                        .distinct()
                        .collect(Collectors.toList()),
                "CONSUMER",
                status.trim().toUpperCase()
        );
    }

    /**
     * Count wholesaler orders placed for a specific product.
     */
    public long countWholesalerOrdersForProduct(Long productId) {
        return orderRepo.countByProductIdAndUserRole(productId, "WHOLESALER");
    }
}