package com.edutech.supply_of_goods_management.entity;
 
 
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
 
import javax.persistence.*;
import java.util.List;
 
 @Entity
@Table(name = "users") // do not change table name ( do not change this line)
public class User {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(unique = true, nullable = false)
    private String username;
 
    @Column(nullable = false)
    private String password;
 
    @Column(nullable = false)
    private String role;
 
    @Column(nullable = false, unique = true)
    private String email;
 
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;
 
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;
 
    public User() {}
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
 
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
 
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
 
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
 
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
 
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}
 