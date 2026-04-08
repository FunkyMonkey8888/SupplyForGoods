package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.Notification;
import com.edutech.supply_of_goods_management.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

/**
 * Service to create notifications and fetch/update user notifications.
 */
@Service
public class NotificationService {

    private final NotificationRepository repo; // repository for database operations

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    /**
     * Create and save a new notification for a specific user.
     */
    public void notifyUser(Long userId, String role, String title, String message) {
        Notification n = new Notification();
        n.setRecipientUserId(userId);   // who will receive the notification
        n.setRecipientRole(role);       // recipient’s role (USER/MANUFACTURER/etc.)
        n.setTitle(title);              // notification title
        n.setMessage(message);          // notification body content
        repo.save(n);                   // save to database
    }

    /**
     * Get all unread notifications for the given user.
     */
    public List<Notification> getUnread(Long userId) {
        return repo.findByRecipientUserIdAndReadFlagFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark a notification as read (only allowed by the owner).
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {

        Notification n = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Prevent users from marking other users' notifications
        if (!n.getRecipientUserId().equals(userId)) {
            throw new RuntimeException("Not allowed");
        }

        n.setReadFlag(true); // update status
        repo.save(n);        // save changes
    }
}
