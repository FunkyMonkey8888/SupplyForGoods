package com.edutech.supply_of_goods_management.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByProductId(Long productId);

    List<Order> findByProductManufacturerId(Long manufacturerId);

    List<Order> findByProductIdInAndUserRole(List<Long> productIds, String role);

    List<Order> findByProductManufacturerIdAndUserRole(
        Long manufacturerId,
        String role
);

    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("SELECT COUNT(o) FROM Order o")
    Long totalOrders();

    List<Order> findByUser_Id(Long wholesalerId);


}
