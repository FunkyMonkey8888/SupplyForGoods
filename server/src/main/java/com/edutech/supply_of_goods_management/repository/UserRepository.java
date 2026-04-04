package com.edutech.supply_of_goods_management.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.edutech.supply_of_goods_management.entity.User;
import org.springframework.stereotype.Repository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRole(String role);


    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRoles();
}
