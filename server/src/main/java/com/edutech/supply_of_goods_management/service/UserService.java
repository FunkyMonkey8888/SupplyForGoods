package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    public UserDetails loadUserByUsername(String username) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'loadUserByUsername'");
    }

    // implement the user service here

}
