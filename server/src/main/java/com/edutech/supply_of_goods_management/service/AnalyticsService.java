package com.edutech.supply_of_goods_management.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;

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

    public Map<String, Long> getOrderStatusAnalytics() {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : orderRepo.countOrdersByStatus()) {
            result.put((String) row[0], (Long) row[1]);
        }
        return result;
    }

    public Long getTotalOrders() {
        return orderRepo.totalOrders();
    }

    public Map<String, Object> inventoryAnalytics() {
    return Map.of(
        "totalStock", inventoryRepo.totalStock(),
        "lowStockCount", inventoryRepo.lowStockItems().size()
    );
}

    public Map<String, Object> feedbackAnalytics() {
    return Map.of(
        "averageRating", feedbackRepo.avgRating(),
        "totalFeedbacks", feedbackRepo.totalFeedbacks()
    );
}
}
