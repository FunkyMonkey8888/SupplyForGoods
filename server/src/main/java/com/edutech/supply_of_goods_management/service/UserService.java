package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.dto.RegisterRequest;
import com.edutech.supply_of_goods_management.entity.InviteCode;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.InviteCodeRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final InviteCodeRepository inviteRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       InviteCodeRepository inviteRepo,
                       @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.inviteRepo = inviteRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /* ===================== BASIC QUERIES ===================== */

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
    }

    /* ===================== REGISTRATION WITH INVITE ===================== */

    public User registerUser(RegisterRequest req) {

        // ✅ Enforce invite code for privileged roles
        if (!"CONSUMER".equalsIgnoreCase(req.getRole()) || "ADMIN".equalsIgnoreCase(req.getRole())) {

            InviteCode invite = inviteRepo
                    .findByRoleAndUsedFalse(req.getRole().toUpperCase())
                    .orElseThrow(() ->
                            new RuntimeException("Invite code required for role"));

            if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invite code expired");
            }

            if (!passwordEncoder.matches(req.getInviteCode(), invite.getCodeHash())) {
                throw new RuntimeException("Invalid invite code");
            }

            // ✅ One‑time use enforcement
            invite.setUsed(true);
            inviteRepo.save(invite);
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole().toUpperCase());

        return userRepository.save(user);
    }

    /* ===================== SPRING SECURITY LOGIN ===================== */

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Username not found: " + username));

        String authority = user.getRole();

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())  // already BCrypt‑encoded
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
