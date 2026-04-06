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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

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

    // ✅ CORS must be configured at Security layer
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Allow your UI origin(s)
        // Use allowedOriginPatterns to support proxy/ports safely
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:4200",
                "https://orchardsolve.lntedutech.com"
        ));

        // ✅ Allow preflight + PATCH
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // ✅ Allow JWT header + content-type
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));

        // ✅ If you are sending Authorization header, credentials are often needed
        config.setAllowCredentials(true);

        // Optional
        config.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
            .cors() // ✅ IMPORTANT: enable CORS in security
            .and()
            .csrf().disable()
            .sessionManagement()
              .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()

            // ✅ Allow browser preflight calls
            .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // Public endpoints
            .antMatchers("/api/user/register", "/api/user/login").permitAll()
            .antMatchers("/api/auth/**").permitAll()

            // Notifications (your choice)
            .antMatchers("/api/notifications/**").permitAll()

            // Analytics
            .antMatchers("/api/analytics/**").hasAnyAuthority("MANUFACTURER", "WHOLESALER")

            // Manufacturer endpoints
            .antMatchers("/api/manufacturers/**").hasAuthority("MANUFACTURER")

            // Wholesaler endpoints
            .antMatchers(HttpMethod.GET,    "/api/wholesalers/products/**").hasAuthority("WHOLESALER")
            .antMatchers(HttpMethod.POST,   "/api/wholesalers/order").hasAuthority("WHOLESALER")
            .antMatchers(HttpMethod.PUT,    "/api/wholesalers/order/*").hasAuthority("WHOLESALER")

            // ✅ ADD THIS: PATCH cancel endpoint
            .antMatchers(HttpMethod.PATCH,  "/api/wholesalers/order/*/cancel").hasAuthority("WHOLESALER")

            .antMatchers(HttpMethod.GET,    "/api/wholesalers/orders/**").hasAuthority("WHOLESALER")
            .antMatchers(HttpMethod.POST,   "/api/wholesalers/inventories/**").hasAuthority("WHOLESALER")
            .antMatchers(HttpMethod.PUT,    "/api/wholesalers/inventories/**").hasAuthority("WHOLESALER")
            .antMatchers(HttpMethod.GET,    "/api/wholesalers/inventories/**").hasAuthority("WHOLESALER")

            // Consumer endpoints
            .antMatchers(HttpMethod.GET,    "/api/consumers/products/**").hasAuthority("CONSUMER")
            .antMatchers(HttpMethod.POST,   "/api/consumers/order").hasAuthority("CONSUMER")
            .antMatchers(HttpMethod.GET,    "/api/consumers/orders/**").hasAuthority("CONSUMER")
            .antMatchers(HttpMethod.POST,   "/api/consumers/order/*/feedback").hasAuthority("CONSUMER")

            // Everything else
            .anyRequest().authenticated();

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}