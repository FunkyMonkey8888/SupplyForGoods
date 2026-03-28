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

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.csrf().disable()
                .authorizeRequests()

                // ✅ PUBLIC ENDPOINTS
                .antMatchers("/api/user/register", "/api/user/login").permitAll()

                // ✅ MANUFACTURER ENDPOINTS
                .antMatchers("/api/manufacturers/product").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/product/*").hasAuthority("MANUFACTURER")
                .antMatchers("/api/manufacturers/products").hasAuthority("MANUFACTURER")

                // ✅ WHOLESALER ENDPOINTS
                .antMatchers(HttpMethod.GET, "/api/wholesalers/products").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/order").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/order/*").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/orders").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/inventories").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/inventories/*").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/inventories").hasAuthority("WHOLESALER")

                // ✅ CONSUMER ENDPOINTS
                .antMatchers(HttpMethod.GET, "/api/consumers/products").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.GET, "/api/consumers/orders").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order/{orderId}/feedback").hasAuthority("CONSUMER")

                // ✅ ALL OTHER ENDPOINTS REQUIRE AUTH
                .anyRequest().authenticated()

                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // ✅ JWT FILTER BEFORE USERNAME/PASSWORD AUTH
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    // ✅ Needed for AuthenticationManager injection
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}