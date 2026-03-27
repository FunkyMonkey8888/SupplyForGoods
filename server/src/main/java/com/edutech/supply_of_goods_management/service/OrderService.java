package com.edutech.supply_of_goods_management.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import java.util.List;
import java.util.Optional;
// OrderService.java

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public OrderService(OrderRepository orderRepo, ProductRepository productRepo, UserRepository userRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    public Order placeOrder(Long productId, Long userId, Order order) {
        Product p = productRepo.findById(productId).orElseThrow();
        User u = userRepo.findById(userId).orElseThrow();
        order.setProduct(p);
        order.setUser(u);
        return orderRepo.save(order);
    }

    public Order updateOrderStatus(Long id, String status) {
        Order o = orderRepo.findById(id).orElseThrow();
        o.setStatus(status);
        return orderRepo.save(o);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }
}