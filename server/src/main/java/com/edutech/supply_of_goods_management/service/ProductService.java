package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.service.NotificationService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.entity.User;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;               // product DB operations
    private final InventoryRepository inventoryRepo;    // inventory DB operations
    private final UserRepository userRepo;              // user DB operations
    private final OrderService orderService;            // check if product has orders
    private final NotificationService notificationService; // send notifications

    public ProductService(ProductRepository repo,
                          InventoryRepository inventoryRepo,
                          NotificationService ns,
                          UserRepository us,
                          OrderService os) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
        this.userRepo = us;
        this.notificationService = ns;
        this.orderService = os;
    }

    /**
     * Create a new product and notify all wholesalers about it.
     */
    public Product createProduct(Product product) {
        if (product.getPrice() <= 0 || product.getStockQuantity() <= 0)
            throw new IllegalArgumentException("Price or quantity cannot be less than 0");

        Product saved = repo.save(product); // save product in DB

        // Notify wholesalers when a new product is added
        List<User> wholesalers = userRepo.findByRole("WHOLESALER");
        for (User w : wholesalers) {
            notificationService.notifyUser(
                    w.getId(),
                    "WHOLESALER",
                    "New Product Added",
                    "New product added: " + saved.getName()
            );
        }
        return saved;
    }

    /**
     * Update an existing product's details.
     */
    public Product updateProduct(Long id, Product updated) {
        Product p = repo.findById(id).orElseThrow();
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setManufacturerId(updated.getManufacturerId());
        return repo.save(p);
    }

    /**
     * Get all products created by a specific manufacturer.
     */
    public List<Product> getProductsByManufacturer(Long id) {
        return repo.findByManufacturerId(id);
    }

    /**
     * Get all products in the system.
     */
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    /**
     * Delete a product by its ID.
     */
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    /**
     * Get a product using its ID.
     */
    public Product getProductById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    /**
     * Search products by name or description.
     */
    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        String q = query.trim();
        return repo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
    }

    /**
     * Get products whose stock is below or equal to a threshold.
     */
    public List<Product> getLowStockProducts(int threshold) {
        return repo.findByStockQuantityLessThanEqual(threshold);
    }

    /**
     * Get low‑stock products for a particular manufacturer.
     */
    public List<Product> getLowStockProductsByManufacturer(Long manufacturerId, int threshold) {
        return repo.findByManufacturerIdAndStockQuantityLessThanEqual(manufacturerId, threshold);
    }

    /**
     * Delete product only if no wholesaler has ordered it.
     */
    public void deleteProductIfNoWholesalerOrders(Long productId) {
        long cnt = orderService.countWholesalerOrdersForProduct(productId);
        if (cnt > 0) {
            throw new RuntimeException("Cannot delete product. Wholesaler orders exist: " + cnt);
        }
        repo.deleteById(productId);
    }
}