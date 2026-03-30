package com.edutech.supply_of_goods_management.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByWholesalerId(Long wholesalerId);

    List<Inventory> findByProductId(Long productId);

    

    
    Optional<Inventory> findByProductAndWholesalerId(
            Product product,
            Long wholesalerId
    );

    Optional<Product> findByProduct(Product product);

    Optional<Inventory> findFirstByProduct(Product product);

}
