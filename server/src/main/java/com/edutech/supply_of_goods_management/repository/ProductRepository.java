package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Product;

import java.util.List;

// Repository interface for Product entity
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by manufacturer ID
    List<Product> findByManufacturerId(Long manufacturerId);
}