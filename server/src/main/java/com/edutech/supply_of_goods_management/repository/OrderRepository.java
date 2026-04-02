package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Order;

import java.util.List;

// Repository interface for Order entity
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by user ID
    List<Order> findByUserId(Long userId);

    // Find orders by product ID
    List<Order> findByProductId(Long productId);

    // Find orders by manufacturer ID
    List<Order> findByProductManufacturerId(Long manufacturerId);

    // Find orders by product IDs and user role
    List<Order> findByProductIdInAndUserRole(List<Long> productIds, String role);
}