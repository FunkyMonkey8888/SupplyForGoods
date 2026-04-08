package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller that handles analytics for Manufacturers and Wholesalers.
 * Provides basic and advanced statistical insights such as total orders,
 * cancellation rates, stock analysis, and top-performing products.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final OrderRepository orderRepo;
    private final InventoryRepository inventoryRepo;

    // Constructor Injection for repositories (best practice)
    public AnalyticsController(OrderRepository orderRepo,
                               InventoryRepository inventoryRepo) {
        this.orderRepo = orderRepo;
        this.inventoryRepo = inventoryRepo;
    }

    /* =====================================================
       WHOLESALER BASIC ANALYTICS
       ===================================================== */

    /**
     * Returns basic analytics for a wholesaler such as:
     * - Total orders made by consumers for the wholesaler's products
     * - Order status counts (pending/confirmed/cancelled)
     * - Total available stock and low-stock items
     *
     * @param wholesalerId ID of the wholesaler
     * @return Map containing basic analytics
     */
    @GetMapping("/wholesaler")
    public Map<String, Object> getWholesalerAnalytics(@RequestParam Long wholesalerId) {

        Map<String, Object> analytics = new HashMap<>();

        // Fetch all products owned by the wholesaler through inventory
        List<Long> productIds = inventoryRepo.findByWholesalerId(wholesalerId)
                .stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch consumer orders related to wholesaler’s products
        List<Order> orders = productIds.isEmpty()
                ? Collections.emptyList()
                : orderRepo.findByProductIdInAndUserRole(productIds, "CONSUMER");

        // Count orders by status
        long pendingOrders = orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long confirmedOrders = orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long cancelledOrders = orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        analytics.put("totalOrders", orders.size());
        analytics.put("pendingOrders", pendingOrders);
        analytics.put("confirmedOrders", confirmedOrders);
        analytics.put("cancelledOrders", cancelledOrders);

        // Stock insights
        List<Inventory> inventories = inventoryRepo.findByWholesalerId(wholesalerId);

        int totalStock = inventories.stream().mapToInt(Inventory::getStockQuantity).sum();
        long lowStockItems = inventories.stream().filter(i -> i.getStockQuantity() < 10).count();

        analytics.put("totalStock", totalStock);
        analytics.put("lowStock", lowStockItems);

        return analytics;
    }

    /* =====================================================
       MANUFACTURER BASIC ANALYTICS
       ===================================================== */

    /**
     * Provides basic analytics for a manufacturer such as:
     * - Total orders received
     * - Breakdown of order statuses
     *
     * @param manufacturerId ID of the manufacturer
     * @return Map with basic manufacturer analytics
     */
    @GetMapping("/manufacturer")
    public Map<String, Object> getManufacturerAnalytics(@RequestParam Long manufacturerId) {

        Map<String, Object> analytics = new HashMap<>();

        // Fetch wholesaler orders for products created by the manufacturer
        List<Order> orders = orderRepo.findByProductManufacturerIdAndUserRole(manufacturerId, "WHOLESALER");

        // Count order statuses
        long confirmedOrders = orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long cancelledOrders = orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();
        long pendingOrders = orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();

        analytics.put("totalOrders", orders.size());
        analytics.put("confirmedOrders", confirmedOrders);
        analytics.put("cancelledOrders", cancelledOrders);
        analytics.put("pendingOrders", pendingOrders);

        return analytics;
    }

    /* =====================================================
       MANUFACTURER ADVANCED ANALYTICS
       ===================================================== */

    /**
     * Advanced analytics for manufacturers including:
     * - Total orders and cancelled orders
     * - Cancellation rate
     * - Number of unique wholesalers
     * - Average order quantity
     * - Top-selling products
     */
    @GetMapping("/manufacturer/advanced")
    public Map<String, Object> manufacturerAdvanced(@RequestParam Long manufacturerId) {

        // Fetch aggregated values using repository custom queries
        Long total = safeLong(orderRepo.countManufacturerOrders(manufacturerId));
        Long cancelled = safeLong(orderRepo.countManufacturerCancelled(manufacturerId));
        Long uniqueWholesalers = safeLong(orderRepo.countUniqueWholesalersForManufacturer(manufacturerId));
        Double avgQty = safeDouble(orderRepo.avgManufacturerOrderQty(manufacturerId));

        double cancellationRate = (total == 0) ? 0.0 : (cancelled * 100.0 / total);

        // Fetch top products based on order count and quantity
        List<Map<String, Object>> topProducts = orderRepo.topProductsForManufacturer(manufacturerId)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("productId", row[0]);
                    m.put("productName", row[1]);
                    m.put("orderCount", row[2]);
                    m.put("quantitySum", row[3]);
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> out = new HashMap<>();
        out.put("totalOrders", total);
        out.put("cancelledOrders", cancelled);
        out.put("cancellationRate", round2(cancellationRate));
        out.put("uniqueWholesalers", uniqueWholesalers);
        out.put("avgOrderQuantity", round2(avgQty));
        out.put("topProducts", topProducts);

        return out;
    }

    /* =====================================================
       WHOLESALER ADVANCED ANALYTICS
       ===================================================== */

    /**
     * Provides advanced analytics for wholesalers including:
     * - Total and cancelled consumer orders
     * - Cancellation percentage
     * - Number of unique consumers
     * - Average order quantity
     * - Top-performing products sold to consumers
     */
    @GetMapping("/wholesaler/advanced")
    public Map<String, Object> wholesalerAdvanced(@RequestParam Long wholesalerId) {

        // Product IDs owned by the wholesaler
        List<Long> productIds = inventoryRepo.findByWholesalerId(wholesalerId)
                .stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        // If wholesaler has no products
        if (productIds.isEmpty()) {
            Map<String, Object> out = new HashMap<>();
            out.put("totalOrders", 0L);
            out.put("cancelledOrders", 0L);
            out.put("cancellationRate", 0.0);
            out.put("uniqueConsumers", 0L);
            out.put("avgOrderQuantity", 0.0);
            out.put("topProducts", Collections.emptyList());
            return out;
        }

        Long total = safeLong(orderRepo.countConsumerOrdersForProducts(productIds));
        Long cancelled = safeLong(orderRepo.countConsumerCancelledForProducts(productIds));
        Long uniqueConsumers = safeLong(orderRepo.countUniqueConsumersForProducts(productIds));
        Double avgQty = safeDouble(orderRepo.avgConsumerOrderQtyForProducts(productIds));

        double cancellationRate = (total == 0) ? 0.0 : (cancelled * 100.0 / total);

        // Build top-product analytics
        List<Map<String, Object>> topProducts = orderRepo.topProductsForWholesaler(productIds)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("productId", row[0]);
                    m.put("productName", row[1]);
                    m.put("orderCount", row[2]);
                    m.put("quantitySum", row[3]);
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> out = new HashMap<>();
        out.put("totalOrders", total);
        out.put("cancelledOrders", cancelled);
        out.put("cancellationRate", round2(cancellationRate));
        out.put("uniqueConsumers", uniqueConsumers);
        out.put("avgOrderQuantity", round2(avgQty));
        out.put("topProducts", topProducts);

        return out;
    }

    /* =====================================================
       HELPER METHODS
       ===================================================== */

    // Safely handle null values from database queries
    private Long safeLong(Long v) { return v == null ? 0L : v; }
    private Double safeDouble(Double v) { return v == null ? 0.0 : v; }

    // Round a number to 2 decimal places
    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}