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

@RestController
@RequestMapping("/api/auth")
public class OtpAuthController {

    private final OtpService otpService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    // ✅ NEW for 2FA
    private final AuthenticationManager authenticationManager;

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
       PASSWORDLESS OTP (your existing flow) - keep if needed
       ===================================================== */

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

    /* =====================================================
       2FA OTP LOGIN (Username/Password -> OTP -> JWT)
       ===================================================== */

    // ✅ Step 1: password is verified, then OTP is sent to email
    @PostMapping("/2fa/login")
    public ResponseEntity<?> login2faStep1(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        // ✅ verify username/password (if wrong -> throws)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Send OTP to user's email
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

    // ✅ Step 2: verify OTP, then issue JWT
    @PostMapping("/2fa/verify")
    public ResponseEntity<?> login2faStep2(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String otp = body.get("otp");

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ verify OTP against the user's email
        otpService.verifyOtpOrThrow(user.getEmail(), otp);

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

    @PostMapping("/register/request-otp")
public ResponseEntity<?> requestRegisterOtp(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    otpService.requestOtp(email);
    return ResponseEntity.ok(Map.of("message", "OTP sent"));
}

@PostMapping("/register/verify-otp")
public ResponseEntity<?> verifyRegisterOtp(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String otp = body.get("otp");

    otpService.verifyOtpOrThrow(email, otp);

    // ✅ Do NOT issue JWT here, just confirm OTP
    return ResponseEntity.ok(Map.of("verified", true));
}

}