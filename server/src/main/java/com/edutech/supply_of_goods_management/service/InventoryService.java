package com.edutech.supply_of_goods_management.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
@Service
public class InventoryService {

    private final InventoryRepository repo;
    private final ProductRepository productRepo;

    public InventoryService(InventoryRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    public Inventory addInventory(Long productId, Inventory inventory) {
        Product p = productRepo.findById(productId).orElseThrow();
        inventory.setProduct(p);
        return repo.save(inventory);
    }

    public Inventory updateInventory(Long id, int qty) {
        Inventory inv = repo.findById(id).orElseThrow();
        inv.setStockQuantity(qty);
        return repo.save(inv);
    }

    public List<Inventory> getInventoriesByWholesaler(Long wholesalerId) {
        return repo.findByWholesalerId(wholesalerId);
    }
}