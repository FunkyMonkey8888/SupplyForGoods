package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.Notification;
import com.edutech.supply_of_goods_management.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public void notifyUser(Long userId, String role, String title, String message) {
        Notification n = new Notification();
        n.setRecipientUserId(userId);
        n.setRecipientRole(role);
        n.setTitle(title);
        n.setMessage(message);
        repo.save(n);
    }

    public List<Notification> getUnread(Long userId) {
        return repo.findByRecipientUserIdAndReadFlagFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = repo.findById(notificationId).orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getRecipientUserId().equals(userId)) {
            throw new RuntimeException("Not allowed");
        }
        n.setReadFlag(true);
        repo.save(n);
    }
}