package com.edutech.supply_of_goods_management.controller;

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

    public ConsumerController(ProductService productService,
                              OrderService orderService,
                              FeedbackService feedbackService) {
        this.productService = productService;
        this.orderService = orderService;
        this.feedbackService = feedbackService;
    }

    /* ============================================================
       ✅ UPDATED: Browse Products WITH sorting + search + pagination
       ============================================================ */
    @GetMapping("/products")
    public ResponseEntity<List<Product>> browseProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {

        // ✅ If no params → behave EXACTLY as before
        if (name == null && sort == null && minPrice == null &&
            maxPrice == null && page == null && size == null) {

            return ResponseEntity.ok(productService.getAllProducts());
        }

        // ✅ Enhanced behavior
        return ResponseEntity.ok(
                productService.getEnhancedProducts(
                        name, sort, minPrice, maxPrice, page, size
                )
        );
    }

    /* ✅ Place Order */
    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestBody Order order) {

        return ResponseEntity.ok(orderService.placeOrder(productId, userId, order));
    }

    /* ✅ Get All Orders for consumer */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    /* ✅ Provide Feedback */
    @PostMapping("/order/{orderId}/feedback")
    public ResponseEntity<Feedback> provideFeedback(
            @PathVariable Long orderId,
            @RequestParam Long userId,
            @RequestBody Feedback feedback) {

        return ResponseEntity.ok(feedbackService.giveFeedback(orderId, userId, feedback));
    }
}