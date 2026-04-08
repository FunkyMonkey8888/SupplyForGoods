package com.edutech.supply_of_goods_management.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;

/**
 * Provides analytics data for orders, inventory, and feedback.
 * Used for showing graphs and statistics in admin/manufacturer dashboards.
 */
@Service
public class AnalyticsService {
    
    private final OrderRepository orderRepo;
    private final InventoryRepository inventoryRepo;
    private final FeedbackRepository feedbackRepo;

    public AnalyticsService(OrderRepository orderRepo, InventoryRepository inventoryRepo,
                            FeedbackRepository feedbackRepo) {
        this.orderRepo = orderRepo;
        this.inventoryRepo = inventoryRepo;
        this.feedbackRepo = feedbackRepo;
    }

    /**
     * Get count of orders grouped by their status (PENDING, CONFIRMED, CANCELLED).
     */
    public Map<String, Long> getOrderStatusAnalytics() {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : orderRepo.countOrdersByStatus()) {
            result.put((String) row[0], (Long) row[1]); // status -> count
        }
        return result;
    }

    /**
     * Get total number of orders in the system.
     */
    public Long getTotalOrders() {
        return orderRepo.totalOrders();
    }

    /**
     * Get basic inventory statistics: total stock and low-stock items.
     */
    public Map<String, Object> inventoryAnalytics() {
        return Map.of(
            "totalStock", inventoryRepo.totalStock(),
            "lowStockCount", inventoryRepo.lowStockItems().size()
        );
    }

    /**
     * Get average feedback rating and total number of feedback entries.
     */
    public Map<String, Object> feedbackAnalytics() {
        return Map.of(
            "averageRating", feedbackRepo.avgRating(),
            "totalFeedbacks", feedbackRepo.totalFeedbacks()
        );
    }
}