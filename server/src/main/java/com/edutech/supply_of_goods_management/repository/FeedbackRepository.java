package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.edutech.supply_of_goods_management.entity.Feedback;

import java.util.List;

// Repository interface for Feedback entity
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find feedbacks by order ID
    List<Feedback> findByOrderId(Long orderId);

    // Find feedbacks by user ID
    List<Feedback> findByUserId(Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
Double avgRating();

@Query("SELECT COUNT(f) FROM Feedback f")
Long totalFeedbacks();
}

