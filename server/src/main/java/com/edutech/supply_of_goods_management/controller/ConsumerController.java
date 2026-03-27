package com.edutech.supply_of_goods_management.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.FeedbackService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;
@RestController
@RequestMapping("/api/consumers")
public class ConsumerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final FeedbackService feedbackService;

    public ConsumerController(ProductService productService, OrderService orderService, FeedbackService feedbackService) {
        this.productService = productService;
        this.orderService = orderService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("/products")
    public List<Product> browseProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/order")
    public Order placeOrder(@RequestParam Long productId,
                            @RequestParam Long userId,
                            @RequestBody Order order) {
        return orderService.placeOrder(productId, userId, order);
    }

    @GetMapping("/orders")
    public List<Order> getOrders(@RequestParam Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @PostMapping("/order/{orderId}/feedback")
    public Feedback giveFeedback(@PathVariable Long orderId,
                                 @RequestParam Long userId,
                                 @RequestBody Feedback feedback) {
        return feedbackService.giveFeedback(orderId, userId, feedback);
    }
}