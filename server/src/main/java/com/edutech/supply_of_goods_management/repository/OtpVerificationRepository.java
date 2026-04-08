package com.edutech.supply_of_goods_management.repository;

import com.edutech.supply_of_goods_management.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for handling OTP verification records.
 * Used to fetch latest OTP entries for login or registration.
 */
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    /**
     * Get the most recent unused OTP for a user’s email.
     * (Used for validating OTP during login or registration)
     */
    Optional<OtpVerification> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    
     // Find an OTP by ID only if it is not already used.
    
    Optional<OtpVerification> findByIdAndUsedFalse(Long id);

    
//Get the most recent OTP for an email (used or unused).
    
    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);
}