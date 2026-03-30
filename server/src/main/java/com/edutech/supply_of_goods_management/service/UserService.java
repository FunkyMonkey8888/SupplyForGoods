
package com.edutech.supply_of_goods_management.service;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, 
                       @Lazy PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }



    public User getByUsername(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /* -------------------------------------------------
       USER REGISTRATION HELPER (OPTIONAL)
       ------------------------------------------------- */

    public User registerUser(User user) {
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repo.save(user);
    }


    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> 
                        new UsernameNotFoundException("Username not found: " + username));


        String roleFromDb = user.getRole() == null 
                ? "ROLE_CONSUMER"
                : user.getRole().trim().toUpperCase();

        String authority = roleFromDb;

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())  
                .authorities(Collections.singleton(
                        new SimpleGrantedAuthority(authority)
                ))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}

// // UserService.java
// package com.edutech.supply_of_goods_management.service;

// import com.edutech.supply_of_goods_management.entity.User;
// import com.edutech.supply_of_goods_management.repository.UserRepository;

// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.context.annotation.Lazy;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import java.net.PasswordAuthentication;
// import java.util.Collections;

// @Service
// public class UserService implements UserDetailsService {

//     private final UserRepository repo;

//     private final PasswordEncoder passwordEncoder;
//     public UserService(UserRepository repo, @Lazy PasswordEncoder ps) {
//         this.repo = repo;
//         this.passwordEncoder = ps;
//     }

//     public User getByUsername(String username) {
//         return repo.findByUsername(username).orElse(null);
//     }

//     // @Override
//     // public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

//     //     User user = repo.findByUsername(username)
//     //             .orElseThrow(() -> new UsernameNotFoundException("Not found"));

//     //     return new org.springframework.security.core.userdetails.User(
//     //             user.getUsername(),
//     //             user.getPassword(),
//     //             Collections.singleton(() -> user.getRole())
//     //     );
//     // }

//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

//     User s = repo.findByUsername(username)
//         .orElseThrow(() -> new UsernameNotFoundException("username not found"));

//     String dbRole = (s.getRole() == null ? "CONSUMER" : s.getRole().trim().toUpperCase());
//     String authority = dbRole.startsWith("ROLE_") ? dbRole : "ROLE_" + dbRole;

//     return org.springframework.security.core.userdetails.User.builder()
//         .username(s.getUsername())
//         .password(s.getPassword())
//         .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority(authority))
//         .accountLocked(false).accountExpired(false).credentialsExpired(false).disabled(false)
//         .build();
//     }
// }
