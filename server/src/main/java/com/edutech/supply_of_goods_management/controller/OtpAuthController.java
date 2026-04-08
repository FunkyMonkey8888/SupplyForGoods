package com.edutech.supply_of_goods_management.controller;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.service.OtpService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles login & registration using OTP and 2FA.
 * Supports: passwordless login, login with OTP, and registration OTP verification.
 */
@RestController
@RequestMapping("/api/auth")
public class OtpAuthController {

    private final OtpService otpService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager; // used for step-1 password check in 2FA

    public OtpAuthController(OtpService otpService,
                             UserRepository userRepo,
                             JwtUtil jwtUtil,
                             AuthenticationManager authenticationManager) {
        this.otpService = otpService;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /* =====================================================
       PASSWORDLESS OTP LOGIN
       ===================================================== */

    /**
     * Step 1: Send OTP to user's email for login (no password needed).
     */
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        otpService.requestOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    /**
     * Step 2: Verify OTP; if correct, generate JWT token and return user details.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        otpService.verifyOtpOrThrow(email, otp); // checks OTP validity

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Convert user into Spring Security UserDetails
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();

        // Generate JWT token after OTP verification
        String token = jwtUtil.generateToken(userDetails, user.getRole());

        // Return full login response
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

    /* =====================================================
       TWO-FACTOR AUTH (USERNAME/PASSWORD + OTP)
       ===================================================== */

    /**
     * Step 1 of 2FA: Validate username/password, then send OTP to email.
     */
    @PostMapping("/2fa/login")
    public ResponseEntity<?> login2faStep1(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        // Verify credentials (throws error if wrong)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Send OTP after password verification
        otpService.requestOtp(user.getEmail());

        return ResponseEntity.ok(
                Map.of(
                        "otpRequired", true,
                        "message", "OTP sent to registered email",
                        "email", user.getEmail(),
                        "username", user.getUsername()
                )
        );
    }

    /**
     * Step 2 of 2FA: Verify OTP and issue JWT token.
     */
    @PostMapping("/2fa/verify")
    public ResponseEntity<?> login2faStep2(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String otp = body.get("otp");

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check OTP for this user
        otpService.verifyOtpOrThrow(user.getEmail(), otp);

        // Convert to UserDetails for token generation
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();

        // Create JWT token after successful verification
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

    /* =====================================================
       OTP FOR REGISTRATION (NO LOGIN)
       ===================================================== */

    /**
     * Send OTP to email during registration process.
     */
    @PostMapping("/register/request-otp")
    public ResponseEntity<?> requestRegisterOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        otpService.requestOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    /**
     * Verify OTP during registration (no token is created yet).
     */
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegisterOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        otpService.verifyOtpOrThrow(email, otp);

        // Only confirm OTP — actual user registration happens separately
        return ResponseEntity.ok(Map.of("verified", true));
    }
}