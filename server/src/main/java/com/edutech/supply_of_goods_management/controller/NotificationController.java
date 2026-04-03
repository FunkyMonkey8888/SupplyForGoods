package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Notification;
import com.edutech.supply_of_goods_management.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // ✅ Fetch unread notifications for logged in user
    @GetMapping("/unread")
    public List<Notification> unread(@RequestParam Long userId) {
        return service.getUnread(userId);
    }

    // ✅ Mark notification as read
    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id, @RequestParam Long userId) {
        service.markAsRead(id, userId);
    }
}