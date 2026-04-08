package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.OtpVerification;
import com.edutech.supply_of_goods_management.repository.OtpVerificationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Service for generating, sending, and validating OTP codes.
 */
@Service
public class OtpService {

    private final OtpVerificationRepository otpRepo;    // DB operations for OTP
    private final PasswordEncoder passwordEncoder;       // securely hash OTP
    private final EmailService emailService;             // send OTP email

    private final SecureRandom random = new SecureRandom(); // generates secure 6‑digit OTP

    public OtpService(OtpVerificationRepository otpRepo,
                      PasswordEncoder passwordEncoder,
                      EmailService emailService) {
        this.otpRepo = otpRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Generate a new OTP, store it hashed, and send email to user.
     */
    public void requestOtp(String email) {
        String otp = String.valueOf(100000 + random.nextInt(900000)); // generate 6‑digit OTP

        OtpVerification rec = new OtpVerification();
        rec.setEmail(email.toLowerCase());
        rec.setOtpHash(passwordEncoder.encode(otp));       // store only hashed OTP
        rec.setExpiresAt(LocalDateTime.now().plusMinutes(5)); // OTP valid for 5 min
        rec.setUsed(false);
        rec.setAttempts(0);

        otpRepo.save(rec);                // save OTP record in DB
        emailService.sendOtp(email, otp); // send OTP email
    }

    /**
     * Verify OTP for passwordless login or register login step.
     */
    @Transactional
    public void verifyOtpOrThrow(String email, String otp) {

        String e = email == null ? "" : email.trim().toLowerCase();
        String code = otp == null ? "" : otp.trim();

        // Get latest OTP for the given email
        OtpVerification latest = otpRepo.findTopByEmailOrderByCreatedAtDesc(e)
                .orElseThrow(() -> new RuntimeException("OTP not requested"));

        if (latest.isUsed()) {
            throw new RuntimeException("OTP already used. Please request a new OTP.");
        }

        if (latest.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (latest.getAttempts() >= 5) {
            throw new RuntimeException("Too many attempts");
        }

        latest.setAttempts(latest.getAttempts() + 1); // increase attempt count

        // Validate hashed OTP
        if (!passwordEncoder.matches(code, latest.getOtpHash())) {
            otpRepo.save(latest);
            throw new RuntimeException("Invalid OTP");
        }

        latest.setUsed(true); // OTP successfully verified
        otpRepo.save(latest);
    }

    /**
     * Verify OTP specifically used for 2FA sessions (username/password login flow).
     */
    @Transactional
    public void verifyOtpFor2FAOrThrow(Long otpId, String otp) {

        // Find OTP by ID but only if unused
        OtpVerification rec = otpRepo.findByIdAndUsedFalse(otpId)
                .orElseThrow(() -> new RuntimeException("OTP session not found"));

        if (rec.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (rec.getAttempts() >= 5) {
            throw new RuntimeException("Too many attempts");
        }

        rec.setAttempts(rec.getAttempts() + 1); // increase attempt count

        // Validate OTP hash
        if (!passwordEncoder.matches(otp, rec.getOtpHash())) {
            otpRepo.save(rec);
            throw new RuntimeException("Invalid OTP");
        }

        rec.setUsed(true); // mark OTP as consumed
        otpRepo.save(rec);
    }
}