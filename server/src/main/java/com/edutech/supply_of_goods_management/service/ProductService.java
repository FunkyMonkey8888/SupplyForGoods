package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;

import java.util.List;

// Service class for product-related operations
@Service
public class ProductService {

    // Repository dependencies
    private final ProductRepository repo;
    private final InventoryRepository inventoryRepo;

    // Constructor-based dependency injection
    public ProductService(ProductRepository repo, InventoryRepository inventoryRepo) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
    }

    // Create a new product
    public Product createProduct(Product product) {
        // Validate price and stock quantity
        if (product.getPrice() <= 0 || product.getStockQuantity() <= 0)
            throw new IllegalArgumentException("Price or quantity cannot be less than 0");

        return repo.save(product);
    }

    // Update existing product details
    public Product updateProduct(Long id, Product updated) {
        Product p = repo.findById(id).orElseThrow();
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setManufacturerId(updated.getManufacturerId());
        return repo.save(p);
    }

    // Get products by manufacturer ID
    public List<Product> getProductsByManufacturer(Long id) {
        return repo.findByManufacturerId(id);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    // Delete product by ID
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }
}