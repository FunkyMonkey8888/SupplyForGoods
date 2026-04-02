package com.edutech.supply_of_goods_management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

// DTO for login request data
public class LoginRequest {

    // Username of the user
    private String username;

    // Password of the user
    private String password;

    // Constructor used for JSON deserialization
    @JsonCreator
    public LoginRequest(@JsonProperty("username") String username,
                        @JsonProperty("password") String password) {
        this.username = username;
        this.password = password;
    }

    // Get username
    public String getUsername() {
        return username;
    }

    // Set username
    public void setUsername(String username) {
        this.username = username;
    }

    // Get password
    public String getPassword() {
        return password;
    }

    // Set password
    public void setPassword(String password) {
        this.password = password;
    }
}