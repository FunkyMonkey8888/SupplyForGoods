package com.edutech.supply_of_goods_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.supply_of_goods_management.entity.InviteCode;

public interface InviteCodeRepository extends JpaRepository<InviteCode, Long> {
      Optional<InviteCode> findByRoleAndUsedFalse(String role);
}
