package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

// Service class for inventory operations
@Service
public class InventoryService {

    // Repository dependencies
    private final InventoryRepository repo;
    private final ProductRepository productRepo;

    // Constructor-based dependency injection
    public InventoryService(InventoryRepository repo,
                            ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    /* ---------------- BASIC CRUD ---------------- */

    // Add inventory or update existing stock
    public Inventory addInventory(Long productId, Inventory inventory) {

        // Fetch product
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if inventory already exists for product and wholesaler
        Inventory existing = repo
            .findByProductAndWholesalerId(product, inventory.getWholesalerId())
            .orElse(null);

        // If inventory exists, update stock
        if (existing != null) {
            existing.setStockQuantity(
                existing.getStockQuantity() + inventory.getStockQuantity()
            );
            return repo.save(existing);
        }

        // Save new inventory
        inventory.setProduct(product);
        return repo.save(inventory);
    }

    // Update inventory quantity
    public Inventory updateInventory(Long id, int qty) {
        Inventory inv = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        inv.setStockQuantity(qty);
        return repo.save(inv);
    }

    // Get inventories by wholesaler
    public List<Inventory> getInventoriesByWholesaler(Long wholesalerId) {
        return repo.findByWholesalerId(wholesalerId);
    }

    /* ---------------- ORDER STATE MACHINE HOOKS ---------------- */

    // Reserve inventory when order is confirmed
    @Transactional
    public void reserveInventory(Order order) {

        Product product = order.getProduct();

        // Find inventory for the product
        Inventory inventory = repo
                .findFirstByProduct(product)
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found for product"));

        // Check stock availability
        if (inventory.getStockQuantity() < order.getQuantity()) {
            throw new IllegalStateException("Insufficient inventory stock");
        }

        // Deduct stock
        inventory.setStockQuantity(
                inventory.getStockQuantity() - order.getQuantity()
        );

        repo.save(inventory);
    }

    // Release inventory when order is cancelled
    @Transactional
    public void releaseInventory(Order order) {

        Product product = order.getProduct();
        Long wholesalerId = order.getUser().getId();
        int qty = order.getQuantity();

        // Fetch inventory for product and wholesaler
        Inventory inventory = repo
                .findByProductAndWholesalerId(product, wholesalerId)
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found for product")
                );

        // Restore stock
        inventory.setStockQuantity(
                inventory.getStockQuantity() + qty
        );

        repo.save(inventory);
    }

    // Delete inventory by ID
    @Transactional
    public void deleteInventory(Long id){
        Inventory inventory = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found"));
        repo.delete(inventory);
    }
}