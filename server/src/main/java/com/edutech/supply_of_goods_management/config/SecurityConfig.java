// SecurityConfig.java
package com.edutech.supply_of_goods_management.config;

import com.edutech.supply_of_goods_management.jwt.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    // @Autowired
    // private PasswordEncoder encoder;
    @Bean
    public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder();}

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.csrf().disable()
                .authorizeRequests()

                .antMatchers("/api/user/register", "/api/user/login").permitAll()

                .antMatchers("/api/manufacturers/product").hasAuthority("ROLE_MANUFACTURER")
                .antMatchers("/api/manufacturers/product/*").hasAuthority("ROLE_MANUFACTURER")
                .antMatchers("/api/manufacturers/products").hasAuthority("ROLE_MANUFACTURER")

                .antMatchers(HttpMethod.GET, "/api/wholesalers/products").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/order").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/order/*").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/orders").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/inventories").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.PUT, "/api/wholesalers/inventories/*").hasAuthority("ROLE_WHOLESALER")
                .antMatchers(HttpMethod.GET, "/api/wholesalers/inventories").hasAuthority("ROLE_WHOLESALER")

                .antMatchers(HttpMethod.GET, "/api/consumers/products").hasAuthority("ROLE_CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order").hasAuthority("ROLE_CONSUMER")
                .antMatchers(HttpMethod.GET, "/api/consumers/orders").hasAuthority("ROLE_CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order/*/feedback").hasAuthority("ROLE_CONSUMER")

                .anyRequest().authenticated()

                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}