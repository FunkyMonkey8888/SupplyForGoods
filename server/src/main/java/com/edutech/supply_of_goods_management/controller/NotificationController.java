package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.Notification;
import com.edutech.supply_of_goods_management.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


 //Handles all notification-related operations for users.
// Mainly used to fetch unread notifications and mark them as read.
 
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    
     // Get all unread notifications for a specific user.
     //userId is passed from frontend based on logged-in user.
     
    @GetMapping("/unread")
    public List<Notification> unread(@RequestParam Long userId) {
        return service.getUnread(userId);
    }

    //Mark a single notification as read.
     //Helps the UI update notification badge or counter.
     
    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id, @RequestParam Long userId) {
        service.markAsRead(id, userId);
    }
}