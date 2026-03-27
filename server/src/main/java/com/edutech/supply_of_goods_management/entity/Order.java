package com.edutech.supply_of_goods_management.entity;
 
 
import com.fasterxml.jackson.annotation.JsonIgnore;
 
import javax.persistence.*;
import java.util.List;
 
 @Entity
@Table(name = "orders") // do not change the table name ( do not change this line)
public class Order {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private int quantity;
 
    private String status;
 
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
 
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
 
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;
 
    public Order() {}
 
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
 
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
 
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
 
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
 
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}