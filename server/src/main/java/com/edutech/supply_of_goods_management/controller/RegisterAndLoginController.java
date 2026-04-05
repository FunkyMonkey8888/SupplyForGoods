package com.edutech.supply_of_goods_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.dto.LoginRequest;
import com.edutech.supply_of_goods_management.dto.LoginResponse;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.service.UserService;

// REST controller for user registration and login
@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    // Repository to access user data
    private final UserRepository userRepository;

    // Authentication manager for login
    private final AuthenticationManager authenticationManager;

    // Utility for JWT token generation
    private final JwtUtil jwtUtil;

    // Service for user operations
    private final UserService userService;

    // Constructor-based dependency injection
    public RegisterAndLoginController(UserRepository userRepository,
                                      AuthenticationManager authenticationManager,
                                      JwtUtil jwtUtil,
                                      UserService userService) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        // Save user with encoded password
        User saved = userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Login user and generate JWT token
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginRequest loginRequest) {

        try {
            // Authenticate username and password
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            // Return unauthorized if authentication fails
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Fetch user details
        User user = userRepository
                .findByUsername(loginRequest.getUsername())
                .orElseThrow();

        // Build UserDetails for JWT
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole())
                .build();

        // Generate JWT token
        String token = jwtUtil.generateToken(userDetails, user.getRole());

        // Prepare login response
        LoginResponse response = new LoginResponse(
                user.getId(),
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}