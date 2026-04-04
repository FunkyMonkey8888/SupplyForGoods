package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpAuthController {

    private final OtpService otpService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public OtpAuthController(OtpService otpService,
                             UserRepository userRepo,
                             JwtUtil jwtUtil) {
        this.otpService = otpService;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        otpService.requestOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        otpService.verifyOtpOrThrow(email, otp);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();

        String token = jwtUtil.generateToken(userDetails, user.getRole());

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "token", token
                )
        );
    }
}