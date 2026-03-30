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

@Service
public class InventoryService {

    private final InventoryRepository repo;
    private final ProductRepository productRepo;

    public InventoryService(InventoryRepository repo,
                            ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    /* ---------------- BASIC CRUD ---------------- */

//     public Inventory addInventory(Long productId, Inventory inventory) {
//         Product product = productRepo.findById(productId)
//                 .orElseThrow(() -> new RuntimeException("Product not found"));

//         // if(inventory.getWholesalerId() == null ) throw new IllegalArgumentException("Wholesaler cannot be null");

//         inventory.setProduct(product);
//         return repo.save(inventory);
//     }

// public Inventory addInventory(Long productId, Inventory inventory) {

//     Product product = productRepo.findById(productId)
//             .orElseThrow(() -> new RuntimeException("Product not found"));

//     Optional<Inventory> existing = repo
//             .findByProductAndWholesalerId(product, inventory.getWholesalerId());

//     if (existing.isPresent()) {
//         Inventory inv = existing.get();
//         inv.setStockQuantity(inv.getStockQuantity() + inventory.getStockQuantity());
//         return repo.save(inv);
//     }

//     inventory.setProduct(product);
//     return repo.save(inventory);
// }

public Inventory addInventory(Long productId, Inventory inventory) {

    Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

    Inventory existing = repo
        .findByProductAndWholesalerId(product, inventory.getWholesalerId())
        .orElse(null);

    if (existing != null) {
        existing.setStockQuantity(
            existing.getStockQuantity() + inventory.getStockQuantity()
        );
        return repo.save(existing);
    }

    inventory.setProduct(product);
    return repo.save(inventory);
}


    public Inventory updateInventory(Long id, int qty) {
        Inventory inv = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        inv.setStockQuantity(qty);
        return repo.save(inv);
    }

    public List<Inventory> getInventoriesByWholesaler(Long wholesalerId) {
        return repo.findByWholesalerId(wholesalerId);
    }

    /* ---------------- ORDER STATE MACHINE HOOKS ---------------- */

    /**
     * Called when OrderStatus moves to CONFIRMED
     */
    @Transactional
public void reserveInventory(Order order) {

    Product product = order.getProduct();

    // ✅ Find the wholesaler who owns inventory for this product
    Inventory inventory = repo
            .findFirstByProduct(product)
            .orElseThrow(() ->
                new RuntimeException("Inventory not found for product"));

    // ✅ Stock check
    if (inventory.getStockQuantity() < order.getQuantity()) {
        throw new IllegalStateException("Insufficient inventory stock");
    }

    // ✅ Deduct stock
    inventory.setStockQuantity(
            inventory.getStockQuantity() - order.getQuantity()
    );

    repo.save(inventory);
}

    /**
     * Called when OrderStatus moves to CANCELLED
     */
    @Transactional
    public void releaseInventory(Order order) {

        Product product = order.getProduct();
        Long wholesalerId = order.getUser().getId();
        int qty = order.getQuantity();

        Inventory inventory = repo
                .findByProductAndWholesalerId(product, wholesalerId)
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found for product")
                );

        inventory.setStockQuantity(
                inventory.getStockQuantity() + qty
        );

        repo.save(inventory);
    }
}