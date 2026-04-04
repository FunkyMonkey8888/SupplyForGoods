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

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final OrderRepository orderRepo;
    private final InventoryRepository inventoryRepo;

    public AnalyticsController(OrderRepository orderRepo,
                               InventoryRepository inventoryRepo) {
        this.orderRepo = orderRepo;
        this.inventoryRepo = inventoryRepo;
    }

    /* =====================================================
       WHOLESALER ANALYTICS (basic)
       ===================================================== */

    @GetMapping("/wholesaler")
    public Map<String, Object> getWholesalerAnalytics(@RequestParam Long wholesalerId) {

        Map<String, Object> analytics = new HashMap<>();

        // NOTE: This assumes findByUser_Id returns wholesaler's own orders.
        // If your wholesaler dashboard is based on consumer-orders, use advanced endpoint below.
        List<Long> productIds = inventoryRepo.findByWholesalerId(wholesalerId)
                .stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        List<Order> orders = productIds.isEmpty()
                ? Collections.emptyList()
                : orderRepo.findByProductIdInAndUserRole(productIds, "CONSUMER");
        long pendingOrders = orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long confirmedOrders = orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long cancelledOrders = orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        analytics.put("totalOrders", orders.size());
        analytics.put("pendingOrders", pendingOrders);
        analytics.put("confirmedOrders", confirmedOrders);
        analytics.put("cancelledOrders", cancelledOrders);

        List<Inventory> inventories = inventoryRepo.findByWholesalerId(wholesalerId);

        int totalStock = inventories.stream().mapToInt(Inventory::getStockQuantity).sum();
        long lowStockItems = inventories.stream().filter(i -> i.getStockQuantity() < 10).count();

        analytics.put("totalStock", totalStock);
        analytics.put("lowStock", lowStockItems);

        return analytics;
    }

    /* =====================================================
       MANUFACTURER ANALYTICS (basic)
       ===================================================== */

    @GetMapping("/manufacturer")
    public Map<String, Object> getManufacturerAnalytics(@RequestParam Long manufacturerId) {

        Map<String, Object> analytics = new HashMap<>();

        List<Order> orders = orderRepo.findByProductManufacturerIdAndUserRole(manufacturerId, "WHOLESALER");

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

    @GetMapping("/manufacturer/advanced")
    public Map<String, Object> manufacturerAdvanced(@RequestParam Long manufacturerId) {

        Long total = safeLong(orderRepo.countManufacturerOrders(manufacturerId));
        Long cancelled = safeLong(orderRepo.countManufacturerCancelled(manufacturerId));
        Long uniqueWholesalers = safeLong(orderRepo.countUniqueWholesalersForManufacturer(manufacturerId));
        Double avgQty = safeDouble(orderRepo.avgManufacturerOrderQty(manufacturerId));

        double cancellationRate = (total == 0) ? 0.0 : (cancelled * 100.0 / total);

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

    @GetMapping("/wholesaler/advanced")
    public Map<String, Object> wholesalerAdvanced(@RequestParam Long wholesalerId) {

        List<Long> productIds = inventoryRepo.findByWholesalerId(wholesalerId)
                .stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            Map<String, Object> out = new HashMap<>();
            out.put("totalOrders", 0L);
            out.put("cancelledOrders", 0L);
            out.put("cancellationRate", 0.0);
            out.put("uniqueConsumers", 0L);
            out.put("avgOrderQuantity", 0.0);
            out.put("topProducts", Collections.emptyList()); // ✅ Java 8 safe
            return out;
        }

        Long total = safeLong(orderRepo.countConsumerOrdersForProducts(productIds));
        Long cancelled = safeLong(orderRepo.countConsumerCancelledForProducts(productIds));
        Long uniqueConsumers = safeLong(orderRepo.countUniqueConsumersForProducts(productIds));
        Double avgQty = safeDouble(orderRepo.avgConsumerOrderQtyForProducts(productIds));

        double cancellationRate = (total == 0) ? 0.0 : (cancelled * 100.0 / total);

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

    // ---------- helpers ----------
    private Long safeLong(Long v) { return v == null ? 0L : v; }
    private Double safeDouble(Double v) { return v == null ? 0.0 : v; }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}