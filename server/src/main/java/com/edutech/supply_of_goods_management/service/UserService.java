
package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

// Service class for user-related operations
@Service
public class UserService implements UserDetailsService {

    // Repository dependency
    private final UserRepository repo;

    // Password encoder for encrypting passwords
    private final PasswordEncoder passwordEncoder;

    // Constructor-based dependency injection
    public UserService(UserRepository repo,
                       @Lazy PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    // Get user by username
    public User getByUsername(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
    }

    // Register a new user with encoded password
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repo.save(user);
    }

    // Load user details for Spring Security
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = repo.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Username not found: " + username));

        // Get role from database
        String roleFromDb = user.getRole() == null
                ? "ROLE_CONSUMER"
                : user.getRole().trim().toUpperCase();

        String authority = roleFromDb;

        // Build UserDetails object
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singleton(
                        new SimpleGrantedAuthority(authority)
                ))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
