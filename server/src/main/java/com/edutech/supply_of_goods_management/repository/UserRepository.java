package com.edutech.supply_of_goods_management.repository;


import org.springframework.data.jpa.repository.JpaRepository;


import com.edutech.supply_of_goods_management.entity.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository {

   Object findByUsername(String username);
   // implement the repository here
}
