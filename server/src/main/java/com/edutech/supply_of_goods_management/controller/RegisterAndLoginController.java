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

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public RegisterAndLoginController(UserRepository userRepository,
                                      AuthenticationManager authenticationManager,
                                      JwtUtil jwtUtil,
                                      UserService userService) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    // ✅ REGISTER USER (FIXED)
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

        if (userRepository.existsByUsername(user.getUsername()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        if (userRepository.existsByEmail(user.getEmail()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        // ✅ Use service (password is encoded here)
        User saved = userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ LOGIN USER (CORRECT)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginRequest loginRequest) {

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository
                .findByUsername(loginRequest.getUsername())
                .orElseThrow();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword()) // BCrypt encoded
                .authorities("ROLE_" + user.getRole())
                .build();

        String token = jwtUtil.generateToken(userDetails, user.getRole());

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