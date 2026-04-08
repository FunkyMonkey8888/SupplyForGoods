package com.edutech.supply_of_goods_management.repository;

import com.edutech.supply_of_goods_management.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Repository for Notification entity.
//  Provides database access methods for fetching user notifications.

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all unread notifications for a user, newest first.
     
    List<Notification> findByRecipientUserIdAndReadFlagFalseOrderByCreatedAtDesc(Long recipientUserId);

    //Get all notifications (read + unread) for a user, newest first.

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
}