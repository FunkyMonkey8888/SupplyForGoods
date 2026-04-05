package com.edutech.supply_of_goods_management.repository;

import com.edutech.supply_of_goods_management.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    Optional<OtpVerification> findByIdAndUsedFalse(Long id);
}