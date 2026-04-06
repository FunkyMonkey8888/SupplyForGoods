package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.OtpVerification;
import com.edutech.supply_of_goods_management.repository.OtpVerificationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    public OtpService(OtpVerificationRepository otpRepo,
                      PasswordEncoder passwordEncoder,
                      EmailService emailService) {
        this.otpRepo = otpRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void requestOtp(String email) {
        String otp = String.valueOf(100000 + random.nextInt(900000));



        OtpVerification rec = new OtpVerification();
        rec.setEmail(email.toLowerCase());
        rec.setOtpHash(passwordEncoder.encode(otp));
        rec.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        rec.setUsed(false);
        rec.setAttempts(0);

        otpRepo.save(rec);
        emailService.sendOtp(email, otp);
    }

    @Transactional
public void verifyOtpOrThrow(String email, String otp) {

    String e = email == null ? "" : email.trim().toLowerCase();
    String code = otp == null ? "" : otp.trim();

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

    latest.setAttempts(latest.getAttempts() + 1);

    if (!passwordEncoder.matches(code, latest.getOtpHash())) {
        otpRepo.save(latest);
        throw new RuntimeException("Invalid OTP");
    }

    latest.setUsed(true);
    otpRepo.save(latest);
}


@Transactional
public void verifyOtpFor2FAOrThrow(Long otpId, String otp) {

    OtpVerification rec = otpRepo.findByIdAndUsedFalse(otpId)
            .orElseThrow(() -> new RuntimeException("OTP session not found"));

    if (rec.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new RuntimeException("OTP expired");
    }

    if (rec.getAttempts() >= 5) {
        throw new RuntimeException("Too many attempts");
    }

    rec.setAttempts(rec.getAttempts() + 1);

    if (!passwordEncoder.matches(otp, rec.getOtpHash())) {
        otpRepo.save(rec);
        throw new RuntimeException("Invalid OTP");
    }

    rec.setUsed(true);
    otpRepo.save(rec);
}
}