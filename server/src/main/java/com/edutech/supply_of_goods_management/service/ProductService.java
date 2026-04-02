package com.edutech.supply_of_goods_management.service;

import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final InventoryRepository inventoryRepo;

    public ProductService(ProductRepository repo, InventoryRepository inventoryRepo) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
    }

    /* ✅ Existing logic untouched */
    public Product createProduct(Product product) {
        if (product.getPrice() <= 0 || product.getStockQuantity() <= 0)
            throw new IllegalArgumentException("Price or quantity cannot be less than 0");

        return repo.save(product);
    }

    /* ✅ Existing logic untouched */
    public Product updateProduct(Long id, Product updated) {
        Product p = repo.findById(id).orElseThrow();
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setManufacturerId(updated.getManufacturerId());
        return repo.save(p);
    }

    /* ✅ Existing logic untouched */
    public List<Product> getProductsByManufacturer(Long id) {
        return repo.findByManufacturerId(id);
    }

    /* ✅ Existing "all products" — used by old testcases */
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    /* ✅ Existing delete logic */
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    /* ============================================================
       ✅ NEW ENHANCED METHOD (Sorting + Search + Pagination + Rating)
       ============================================================ */
    public List<Product> getEnhancedProducts(
            String name,
            String sort,
            Double minPrice,
            Double maxPrice,
            Integer page,
            Integer size
    ) {
        List<Product> products = repo.findAll();

        /* ✅ 1. Search Filter */
        if (name != null && !name.trim().isEmpty()) {
            String searchLower = name.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        /* ✅ 2. Price Range Filters */
        if (minPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() >= minPrice)
                    .collect(Collectors.toList());
        }

        if (maxPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        /* ✅ 3. Sorting */
        if (sort != null) {
            switch (sort) {
                case "az":
                    products.sort(Comparator.comparing(Product::getName));
                    break;

                case "za":
                    products.sort(Comparator.comparing(Product::getName).reversed());
                    break;

                case "low-high":
                    products.sort(Comparator.comparing(Product::getPrice));
                    break;

                case "high-low":
                    products.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
            }
        }

        /* ✅ 4. Rating Calculation (simple: number of feedbacks) */
        for (Product p : products) {
            try {
                int rating = (p.getOrders() != null) ?
                        p.getOrders().stream()
                                .flatMap(order -> order.getFeedbacks().stream())
                                .collect(Collectors.toList()).size()
                        : 0;

                p.setRating(rating);   // ✅ transient field
            } catch (Exception ignored) {
                p.setRating(0);
            }
        }

        /* ✅ 5. Pagination (Optional & Safe) */
        if (page != null && size != null && page >= 0 && size > 0) {
            int from = page * size;
            int to = Math.min(from + size, products.size());
            if (from < products.size()) {
                products = products.subList(from, to);
            }
        }

        return products;
    }
}