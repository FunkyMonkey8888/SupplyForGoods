// // SecurityConfig.java
// package com.edutech.supply_of_goods_management.config;

// import com.edutech.supply_of_goods_management.jwt.JwtRequestFilter;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
// import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// // @Configuration
// // @EnableWebSecurity
// // public class SecurityConfig extends WebSecurityConfigurerAdapter {

// // @Autowired
// // private JwtRequestFilter jwtRequestFilter;

// // @Autowired
// // private UserDetailsService userDetailsService;

// // // @Autowired
// // // private PasswordEncoder encoder;
// // @Bean
// // public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder();}

// // @Override
// // protected void configure(AuthenticationManagerBuilder auth) throws Exception {
// // auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
// // }

// // @Override
// // protected void configure(HttpSecurity http) throws Exception {

// // http.csrf().disable()
// // .authorizeRequests()

// // .antMatchers("/api/user/register", "/api/user/login").permitAll()

// // .antMatchers("/api/manufacturers/product").hasRole("MANUFACTURER")
// // .antMatchers("/api/manufacturers/product/*").hasRole("MANUFACTURER")
// // .antMatchers("/api/manufacturers/products").hasRole("MANUFACTURER")

// // .antMatchers(HttpMethod.GET, "/api/wholesalers/products").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.POST, "/api/wholesalers/order").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.PUT, "/api/wholesalers/order/*").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.GET, "/api/wholesalers/orders").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.POST, "/api/wholesalers/inventories").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.PUT, "/api/wholesalers/inventories/*").hasRole("WHOLESALER")
// // .antMatchers(HttpMethod.GET, "/api/wholesalers/inventories").hasRole("WHOLESALER")

// // .antMatchers(HttpMethod.GET, "/api/consumers/products").hasRole("CONSUMER")
// // .antMatchers(HttpMethod.POST, "/api/consumers/order").hasRole("CONSUMER")
// // .antMatchers(HttpMethod.GET, "/api/consumers/orders").hasRole("CONSUMER")
// // .antMatchers(HttpMethod.POST, "/api/consumers/order/{orderId}/feedback").hasRole("CONSUMER")

// // .anyRequest().authenticated()

// // .and()
// // .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

// // http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
// // }
// // }

package com.edutech.supply_of_goods_management.config;

import com.edutech.supply_of_goods_management.jwt.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Configuration class for Spring Security
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    // JWT filter to validate token for every request
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    // Loads user details from database
    @Autowired
    private UserDetailsService userDetailsService;

    // Password encoder using BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configure authentication with user details and password encoder
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }

    // Configure security rules and endpoint access
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.csrf().disable() // Disable CSRF for stateless APIs
                .authorizeRequests()

                // Public access endpoints
                .antMatchers("/api/user/register", "/api/user/login").permitAll()

                // Manufacturer access endpoints
                .antMatchers("/api/manufacturers/product").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/product/*").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/products").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/orders").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/*").hasAuthority("MANUFACTURER")

                // Wholesaler access endpoints
                .antMatchers(HttpMethod.GET, "/api/wholesalers/products").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/order").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/order/*").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/orders").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/inventories").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/inventories/*").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/inventories").hasAuthority("WHOLESALER")

                // Consumer access endpoints
                .antMatchers(HttpMethod.GET, "/api/consumers/products").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.GET, "/api/consumers/orders").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order/{orderId}/feedback")
                .hasAuthority("CONSUMER")

                // All other requests need authentication
                .anyRequest().authenticated()

                .and()
                // Make application stateless
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // Add JWT filter before username-password authentication
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    // Expose AuthenticationManager as a bean
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}