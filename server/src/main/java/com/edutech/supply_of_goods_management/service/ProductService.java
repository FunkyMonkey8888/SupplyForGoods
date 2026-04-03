package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final InventoryRepository inventoryRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public ProductService(ProductRepository repo,
                          InventoryRepository inventoryRepo,
                          NotificationService ns,
                          UserRepository us) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
        this.userRepo = us;
        this.notificationService = ns;
    }

    public Product createProduct(Product product) {
        if (product.getPrice() <= 0 || product.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Price or quantity cannot be less than 0");
        }

        Product saved = repo.save(product);

        // ✅ Notify all wholesalers: new product added
        List<User> wholesalers = userRepo.findByRole("WHOLESALER");
        for (User w : wholesalers) {
            notificationService.notifyUser(
                w.getId(),
                "WHOLESALER",
                "New Product Added",
                "New product added: " + saved.getName()
            );
        }

        // ✅ Optional: Notify manufacturer (self audit)
        if (saved.getManufacturerId() != null) {
            notificationService.notifyUser(
                saved.getManufacturerId(),
                "MANUFACTURER",
                "Product Created",
                "You added a new product: " + saved.getName()
            );
        }

        return saved;
    }

    public Product updateProduct(Long id, Product updated) {
        Product p = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));

        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setManufacturerId(updated.getManufacturerId());

        Product saved = repo.save(p);

        // ✅ Notify all wholesalers: product updated
        List<User> wholesalers = userRepo.findByRole("WHOLESALER");
        for (User w : wholesalers) {
            notificationService.notifyUser(
                w.getId(),
                "WHOLESALER",
                "Product Updated",
                "Product updated: " + saved.getName()
            );
        }

        // ✅ Optional: Notify manufacturer (self audit)
        if (saved.getManufacturerId() != null) {
            notificationService.notifyUser(
                saved.getManufacturerId(),
                "MANUFACTURER",
                "Product Updated",
                "You updated product: " + saved.getName()
            );
        }

        return saved;
    }

    public List<Product> getProductsByManufacturer(Long id) {
        return repo.findByManufacturerId(id);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public void deleteProduct(Long id) {
        Product p = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        repo.deleteById(id);

        // ✅ Notify all wholesalers: product removed
        List<User> wholesalers = userRepo.findByRole("WHOLESALER");
        for (User w : wholesalers) {
            notificationService.notifyUser(
                w.getId(),
                "WHOLESALER",
                "Product Removed",
                "Product removed: " + p.getName()
            );
        }

        // ✅ Optional: Notify manufacturer (self audit)
        if (p.getManufacturerId() != null) {
            notificationService.notifyUser(
                p.getManufacturerId(),
                "MANUFACTURER",
                "Product Removed",
                "You removed product: " + p.getName()
            );
        }
    }
}