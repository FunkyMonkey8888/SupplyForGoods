package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
       WHOLESALER ANALYTICS
       ===================================================== */

    @GetMapping("/wholesaler")
    public Map<String, Object> getWholesalerAnalytics(
            @RequestParam Long wholesalerId) {

        Map<String, Object> analytics = new HashMap<>();

        /* ---------- ORDER ANALYTICS ---------- */
        List<Order> orders =
                orderRepo.findByUser_Id(wholesalerId);

        long pendingOrders =
                orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long confirmedOrders =
                orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long cancelledOrders =
                orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        analytics.put("totalOrders", orders.size());
        analytics.put("pendingOrders", pendingOrders);
        analytics.put("confirmedOrders", confirmedOrders);
        analytics.put("cancelledOrders", cancelledOrders);

        /* ---------- INVENTORY ANALYTICS ---------- */
        List<Inventory> inventories =
                inventoryRepo.findByWholesalerId(wholesalerId);

        int totalStock =
                inventories.stream().mapToInt(Inventory::getStockQuantity).sum();

        long lowStockItems =
                inventories.stream()
                        .filter(i -> i.getStockQuantity() < 10)
                        .count();

        analytics.put("totalStock", totalStock);
        analytics.put("lowStock", lowStockItems);

        return analytics;
    }

    /* =====================================================
       MANUFACTURER ANALYTICS
       ===================================================== */

    @GetMapping("/manufacturer")
    public Map<String, Object> getManufacturerAnalytics(
            @RequestParam Long manufacturerId) {

        Map<String, Object> analytics = new HashMap<>();

        List<Order> orders =
                orderRepo.findByProductManufacturerId(manufacturerId);

        long confirmedOrders =
                orders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();

        long cancelledOrders =
                orders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        long pendingOrders =
                orders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();

        analytics.put("totalOrders", orders.size());
        analytics.put("confirmedOrders", confirmedOrders);
        analytics.put("cancelledOrders", cancelledOrders);
        analytics.put("pendingOrders", pendingOrders);

        return analytics;
    }
}