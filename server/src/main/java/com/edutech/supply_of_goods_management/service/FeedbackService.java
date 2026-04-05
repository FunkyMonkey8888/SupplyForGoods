package com.edutech.supply_of_goods_management.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

// Service class for feedback operations
@Service
public class FeedbackService {

    // Repository dependencies
    private final FeedbackRepository repo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;

    // Constructor-based dependency injection
    public FeedbackService(FeedbackRepository repo,
                           OrderRepository orderRepo,
                           UserRepository userRepo) {
        this.repo = repo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
    }

    // Save feedback for an order by a user
    public Feedback giveFeedback(Long orderId, Long userId, Feedback f) {
        Order o = orderRepo.findById(orderId).orElseThrow();
        User u = userRepo.findById(userId).orElseThrow();
        f.setOrder(o);
        f.setUser(u);
        f.setTimestamp(new Date());
        return repo.save(f);
    }
}
