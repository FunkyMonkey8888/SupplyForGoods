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

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    // ✅ NEW: notifications (added only)
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo,
                        InventoryService inventoryService,
                        InventoryRepository ir,
                        NotificationService notificationService) {

        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.inventoryService = inventoryService;
        this.inventoryRepository = ir;
        this.notificationService = notificationService;
    }

    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("PENDING");

        Order saved = orderRepo.save(order);

        // ✅ NOTIFICATIONS (added only)
        String role = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();
        String productName = product.getName();

        // 1) Consumer order → notify Manufacturer + Wholesalers handling product
        if ("CONSUMER".equals(role)) {

            // notify manufacturer
            if (product.getManufacturerId() != null) {
                notificationService.notifyUser(
                        product.getManufacturerId(),
                        "MANUFACTURER",
                        "New Consumer Order",
                        "New consumer order placed for: " + productName + " (Qty: " + saved.getQuantity() + ")"
                );
            }

            // notify wholesalers who have inventory entries for this product
            List<Inventory> invs = inventoryRepository.findByProductId(productId);
            for (Inventory inv : invs) {
                notificationService.notifyUser(
                        inv.getWholesalerId(),
                        "WHOLESALER",
                        "New Order Placed",
                        "New consumer order for: " + productName + " (Qty: " + saved.getQuantity() + ")"
                );
            }
        }

        // 2) Wholesaler order → notify Manufacturer
        if ("WHOLESALER".equals(role)) {
            if (product.getManufacturerId() != null) {
                notificationService.notifyUser(
                        product.getManufacturerId(),
                        "MANUFACTURER",
                        "New Wholesaler Order",
                        "New wholesaler order placed for: " + productName + " (Qty: " + saved.getQuantity() + ")"
                );
            }
        }

        return saved;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Keep your existing behavior (no changes)
        if ("CONFIRMED".equals(status)) {
            try {
                inventoryService.reserveInventory(order);
            } catch (RuntimeException ex) {

                // ✅ Inventory issue → delete product (your existing logic)
                Product product = order.getProduct();
                productRepo.deleteById(product.getId());

                // ✅ NOTIFICATIONS on failure (added only)
                User placedBy = order.getUser();
                String placedByRole = placedBy.getRole() == null ? "" : placedBy.getRole().trim().toUpperCase();
                Long placedById = placedBy.getId();
                String productName = product.getName();

                // notify the order owner (consumer/wholesaler)
                notificationService.notifyUser(
                        placedById,
                        placedByRole,
                        "Order Failed",
                        "Order could not be confirmed for " + productName + " due to insufficient inventory."
                );

                // optional: notify manufacturer if needed
                if (product.getManufacturerId() != null) {
                    notificationService.notifyUser(
                            product.getManufacturerId(),
                            "MANUFACTURER",
                            "Inventory Issue",
                            "Order confirmation failed due to inventory for: " + productName
                    );
                }

                throw new RuntimeException("Inventory unavailable. Product has been removed.");
            }
        }

        order.setStatus(status);
        Order saved = orderRepo.save(order);

        // ✅ NOTIFICATIONS on status update (added only)
        User placedBy = saved.getUser();
        String placedByRole = placedBy.getRole() == null ? "" : placedBy.getRole().trim().toUpperCase();
        Long placedById = placedBy.getId();
        String productName = saved.getProduct() != null ? saved.getProduct().getName() : "product";

        notificationService.notifyUser(
                placedById,
                placedByRole,
                "Order Status Updated",
                "Your order for " + productName + " is now " + status
        );

        return saved;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    public List<Order> getOrdersByManufacturer(Long manufacturerId) {
        return orderRepo.findByProductManufacturerIdAndUserRole(manufacturerId, "WHOLESALER");
    }

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

    public List<Order> getConsumerOrdersForWholesaler(Long wholesalerId) {

        // Step 1: get all inventories of the wholesaler
        List<Inventory> inventories = inventoryRepository.findByWholesalerId(wholesalerId);

        // Step 2: extract product IDs
        List<Long> productIds = inventories.stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return java.util.Collections.emptyList(); // Java 8 safe
        }

        return orderRepo.findByProductIdInAndUserRole(productIds, "CONSUMER");
    }
}