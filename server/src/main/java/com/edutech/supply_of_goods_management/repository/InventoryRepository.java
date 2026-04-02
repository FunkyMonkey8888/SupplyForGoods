package com.edutech.supply_of_goods_management.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByWholesalerId(Long wholesalerId);

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByProduct(Product product);
    

    
    Optional<Inventory> findByProductAndWholesalerId(
            Product product,
            Long wholesalerId
    );



    Optional<Inventory> findFirstByProduct(Product product);


    @Query("SELECT SUM(i.stockQuantity) FROM Inventory i")
    Long totalStock();

    @Query("SELECT i FROM Inventory i WHERE i.stockQuantity < 10")
    List<Inventory> lowStockItems();

}
