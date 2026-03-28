package com.edutech.supply_of_goods_management.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.edutech.supply_of_goods_management.entity.User;
import org.springframework.stereotype.Repository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
