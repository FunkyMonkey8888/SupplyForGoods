package com.edutech.supply_of_goods_management.entity;
 
 
import javax.persistence.*;
import java.util.Date;
 
 @Entity
@Table(name = "feedbacks")
 
public class Feedback {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String content;
 
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
 
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
 
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
 
    public Feedback() {}
 
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
 
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
 
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
 
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
 