package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;

import java.util.List;
import java.util.Optional;

// Repository interface for Inventory entity
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Find inventories by wholesaler ID
    List<Inventory> findByWholesalerId(Long wholesalerId);

    // Find inventories by product ID
    List<Inventory> findByProductId(Long productId);

    // Find inventories by product
    List<Inventory> findByProduct(Product product);

    // Find inventory by product and wholesaler ID
    Optional<Inventory> findByProductAndWholesalerId(
            Product product,
            Long wholesalerId
    );

    // Find first available inventory for a product
    Optional<Inventory> findFirstByProduct(Product product);


    @Query("SELECT SUM(i.stockQuantity) FROM Inventory i")
    Long totalStock();

    @Query("SELECT i FROM Inventory i WHERE i.stockQuantity < 10")
    List<Inventory> lowStockItems();

}