package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.service.NotificationService;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.entity.User;

import java.util.List;
@Service
public class ProductService {

    private final ProductRepository repo;
    private final InventoryRepository inventoryRepo;
    private final UserRepository userRepo;

    private final NotificationService notificationService;
    public ProductService(ProductRepository repo, InventoryRepository inventoryRepo, NotificationService ns, UserRepository us) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
        this.userRepo = us;
        this.notificationService = ns;
    }

    // Create a new product
    public Product createProduct(Product product) {
        if(product.getPrice() <=0 || product.getStockQuantity() <=0) throw new IllegalArgumentException("Price or quantity cannot be less than 0");

        // after product saved
        Product saved = repo.save(product);
        List<User> wholesalers = userRepo.findByRole("WHOLESALER");  // implement repo method
        for (User w : wholesalers) {
            notificationService.notifyUser(
                w.getId(),
                "WHOLESALER",
                "New Product Added",
                "New product added: " + saved.getName()
            );
        }
            return saved ;
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

    public void deleteProduct(Long id){
        repo.deleteById(id);
    }

    public Product getProductById(Long id) {
    return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
}

public List<Product> searchProducts(String query) {
    if (query == null || query.trim().isEmpty()) return List.of();
    String q = query.trim();
    return repo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
}

public List<Product> getLowStockProducts(int threshold) {
    return repo.findByStockQuantityLessThanEqual(threshold);
}

public List<Product> getLowStockProductsByManufacturer(Long manufacturerId, int threshold) {
    return repo.findByManufacturerIdAndStockQuantityLessThanEqual(manufacturerId, threshold);
}

}