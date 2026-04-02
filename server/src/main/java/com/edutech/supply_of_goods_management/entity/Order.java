package com.edutech.supply_of_goods_management.entity;
 
 
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
 @Entity
@Table(name = "orders") // do not change the table name ( do not change this line)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private int quantity;
 
    // @Enumerated(EnumType.STRING)
    // // @Column(nullable = false)
    // private OrderStatus orderStatus;

    private String status;

    
 
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
 
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Feedback> feedbacks = new ArrayList<>();
 
    public Order() {}
 
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
 

    public String getStatus(){
        return this.status;
    }
 
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
 
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
 
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
    // public OrderStatus getOrderStatus() {
    //     return orderStatus;
    // }

    // public void setOrderStatus(OrderStatus orderStatus) {
    //     this.orderStatus = orderStatus;
    // }

    public void setStatus(String status) {
        this.status = status;
    }
}



// package com.edutech.supply_of_goods_management.entity;

// import com.fasterxml.jackson.annotation.JsonIgnore;
// import com.fasterxml.jackson.annotation.JsonProperty;

// import javax.persistence.*;
// import java.util.ArrayList;
// import java.util.List;

// @Entity
// @Table(name = "orders") // do not change
// public class Order {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @JsonProperty("quantity")
//     private int quantity;

//     // INTERNAL enum storage (DB)
//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     @JsonIgnore
//     private OrderStatus status;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "user_id")
//     private User user;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "product_id")
//     private Product product;

//     @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//     @JsonIgnore
//     private List<Feedback> feedbacks = new ArrayList<>();

//     public Order() {}

//     // ---------- BASIC ----------

//     public Long getId() {
//         return id;
//     }

    
//     public int getQuantity() {
//         return quantity;
//     }

    
//     public void setQuantity(int quantity) {
//         this.quantity = quantity;
//     }

    

//     @JsonProperty("status")
//     public String getStatus() {
//         return status != null ? status.name() : null;
//     }

//     @JsonProperty("status")
//     public void setStatus(String status) {
//         this.status = OrderStatus.valueOf(status.toUpperCase());
//     }

    

//     @JsonIgnore
//     public OrderStatus getStatusEnum() {
//         return status;
//     }

//     @JsonIgnore
//     public void setStatusEnum(OrderStatus status) {
//         this.status = status;
//     }

//     // ---------- RELATIONS ----------

//     public User getUser() {
//         return user;
//     }

//     public void setUser(User user) {
//         this.user = user;
//     }

//     public Product getProduct() {
//         return product;
//     }

//     public void setProduct(Product product) {
//         this.product = product;
//     }

//     public List<Feedback> getFeedbacks() {
//         return feedbacks;
//     }
// }