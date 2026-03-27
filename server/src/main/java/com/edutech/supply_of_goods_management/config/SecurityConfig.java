package com.edutech.supply_of_goods_management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edutech.supply_of_goods_management.jwt.JwtRequestFilter;
import com.edutech.supply_of_goods_management.service.UserService;


public class SecurityConfig  {

    // Implement security configuration here
    // /api/user/register and /api/user/login should be permitted to all
    // /api/manufacturers/product should be permitted to MANUFACTURER
    // /api/manufacturers/product/{id} should be permitted to MANUFACTURER
    // /api/manufacturers/products should be permitted to MANUFACTURER
    // /api/wholesalers/products should be permitted to WHOLESALER
    // /api/wholesalers/order should be permitted to WHOLESALER
    // /api/wholesalers/order/{id} should be permitted to WHOLESALER
    // /api/wholesalers/orders should be permitted to WHOLESALER
    // /api/wholesalers/inventories should be permitted to WHOLESALER (POST)
    // /api/wholesalers/inventories/{id} should be permitted to WHOLESALER
    // /api/wholesalers/inventories should be permitted to WHOLESALER (GET)
    // /api/consumers/products should be permitted to CONSUMER
    // /api/consumers/order should be permitted to CONSUMER
    // /api/consumers/orders should be permitted to CONSUMER
    // /api/consumers/order/{orderId}/feedback should be permitted to CONSUMER

    // Note: Use hasAuthority method to check the role of the user
    // for example, hasAuthority("CONSUMER")
}

// @Configuration
// @EnableWebSecurity
// @EnableGlobalMethodSecurity(prePostEnabled = true)
// public class SecurityConfig extends WebSecurityConfigurerAdapter {

//     @Autowired private JwtRequestFilter jwtRequestFilter;
//     @Autowired private UserService userService;

//     @Bean
//     public PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }

//     @Override
//     protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//         DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//         provider.setUserDetailsService(userService);
//         provider.setPasswordEncoder(passwordEncoder());
//         auth.authenticationProvider(provider);
//     }

//     @Override
//     protected void configure(HttpSecurity http) throws Exception {
//         http.csrf().disable()
//            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//            .and()
//            .authorizeRequests()
//              .antMatchers("/user/register", "/user/login", "/h2-console/**").permitAll()
//              .antMatchers(HttpMethod.GET, "/products/**").authenticated()
//              .antMatchers("/suppliers/**").authenticated()
//              .antMatchers("/warehouses/**").authenticated()
//              .anyRequest().authenticated()
//            .and()
//            .headers().frameOptions().disable();

//         http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
//     }

//     @Override
//     @Bean
//     public AuthenticationManager authenticationManagerBean() throws Exception {
//         return super.authenticationManagerBean();
//     }
// }

