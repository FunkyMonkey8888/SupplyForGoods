package com.edutech.supply_of_goods_management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

// DTO for login response data
public class LoginResponse {

    // Unique user ID
    private Long userId;

    // JWT authentication token
    private String token;

    // Username of the user
    private String username;

    // Email of the user
    private String email;

    // Role of the user
    private String role;

    // Constructor used for JSON serialization
    @JsonCreator
    public LoginResponse(@JsonProperty("userId") Long userId,
                         @JsonProperty("token") String token,
                         @JsonProperty("username") String username,
                         @JsonProperty("email") String email,
                         @JsonProperty("role") String role) {
        this.userId = userId;
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Get token
    public String getToken() {
        return token;
    }

    // Set token
    public void setToken(String token) {
        this.token = token;
    }

    // Get username
    public String getUsername() {
        return username;
    }

    // Set username
    public void setUsername(String username) {
        this.username = username;
    }

    // Get email
    public String getEmail() {
        return email;
    }

    // Set email
    public void setEmail(String email) {
        this.email = email;
    }

    // Get role
    public String getRole() {
        return role;
    }

    // Set role
    public void setRole(String role) {
        this.role = role;
    }

    // Get user ID
    public Long getUserId() {
        return userId;
    }

    // Set user ID
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
