// RegisterAndLoginController.java
package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.dto.LoginRequest;
import com.edutech.supply_of_goods_management.dto.LoginResponse;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public RegisterAndLoginController(UserRepository userRepository,
                                      PasswordEncoder passwordEncoder,
                                      AuthenticationManager authenticationManager,
                                      JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username exists");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

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