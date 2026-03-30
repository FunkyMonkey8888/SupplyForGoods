package com.edutech.supply_of_goods_management.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import java.util.List;
@Service
public class ProductService {

    private final ProductRepository repo;
    private final InventoryRepository inventoryRepo;

    public ProductService(ProductRepository repo, InventoryRepository inventoryRepo) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
    }

    public Product createProduct(Product product) {
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        Product p = repo.findById(id).orElseThrow();
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setManufacturerId(updated.getManufacturerId());
        return repo.save(p);
    }

    public List<Product> getProductsByManufacturer(Long id) {
        return repo.findByManufacturerId(id);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    
public void deleteProduct(Long productId) {

        Product product = repo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Inventory> inventories = inventoryRepo.findByProduct(product);
        inventoryRepo.deleteAll(inventories);

        repo.delete(product);
    }

}