package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
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

    List<Order> findByProductManufacturerIdAndUserRole(
        Long manufacturerId,
        String role
);

    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("SELECT COUNT(o) FROM Order o")
    Long totalOrders();

    List<Order> findByUser_Id(Long wholesalerId);


    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.product.manufacturerId = :mid AND o.user.role = 'WHOLESALER'")
    Long countManufacturerOrders(@Param("mid") Long manufacturerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.product.manufacturerId = :mid AND o.user.role = 'WHOLESALER' AND o.status = 'CANCELLED'")
    Long countManufacturerCancelled(@Param("mid") Long manufacturerId);

    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.product.manufacturerId = :mid AND o.user.role = 'WHOLESALER'")
    Long countUniqueWholesalersForManufacturer(@Param("mid") Long manufacturerId);

    @Query("SELECT AVG(o.quantity) FROM Order o WHERE o.product.manufacturerId = :mid AND o.user.role = 'WHOLESALER'")
    Double avgManufacturerOrderQty(@Param("mid") Long manufacturerId);

    @Query("SELECT o.product.id, o.product.name, COUNT(o), SUM(o.quantity) " +
        "FROM Order o " +
        "WHERE o.product.manufacturerId = :mid AND o.user.role = 'WHOLESALER' " +
        "GROUP BY o.product.id, o.product.name " +
        "ORDER BY COUNT(o) DESC")
    List<Object[]> topProductsForManufacturer(@Param("mid") Long manufacturerId);


    // ---------- WHOLESALER ADVANCED ANALYTICS (by productIds IN ...) ----------
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.role = 'CONSUMER' AND o.product.id IN :pids")
    Long countConsumerOrdersForProducts(@Param("pids") List<Long> productIds);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.role = 'CONSUMER' AND o.product.id IN :pids AND o.status = 'CANCELLED'")
    Long countConsumerCancelledForProducts(@Param("pids") List<Long> productIds);

    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.user.role = 'CONSUMER' AND o.product.id IN :pids")
    Long countUniqueConsumersForProducts(@Param("pids") List<Long> productIds);

    @Query("SELECT AVG(o.quantity) FROM Order o WHERE o.user.role = 'CONSUMER' AND o.product.id IN :pids")
    Double avgConsumerOrderQtyForProducts(@Param("pids") List<Long> productIds);

    @Query("SELECT o.product.id, o.product.name, COUNT(o), SUM(o.quantity) " +
        "FROM Order o " +
        "WHERE o.user.role = 'CONSUMER' AND o.product.id IN :pids " +
        "GROUP BY o.product.id, o.product.name " +
        "ORDER BY COUNT(o) DESC")
    List<Object[]> topProductsForWholesaler(@Param("pids") List<Long> productIds);

    List<Order> findByUserIdAndStatus(Long userId, String status);
List<Order> findByProductManufacturerIdAndUserRoleAndStatus(Long manufacturerId, String role, String status);
List<Order> findByProductIdInAndUserRoleAndStatus(List<Long> productIds, String role, String status);


}
