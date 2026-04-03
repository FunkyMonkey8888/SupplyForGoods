package com.edutech.supply_of_goods_management.repository;

import com.edutech.supply_of_goods_management.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdAndReadFlagFalseOrderByCreatedAtDesc(Long recipientUserId);

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
}