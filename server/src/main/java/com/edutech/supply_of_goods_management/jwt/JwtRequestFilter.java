package com.edutech.supply_of_goods_management.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.UserRepository;
import com.edutech.supply_of_goods_management.service.UserService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// JWT authentication filter for every request
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    // Utility class for JWT operations
    @Autowired 
    private JwtUtil jwtService;

    // Service to load user details
    @Autowired 
    private UserService userService;

    // Filter logic executed for every request
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws IOException, ServletException {

        String path = request.getRequestURI();

        // Skip JWT check for login, register, and OPTIONS requests
        if (path.startsWith("/api/user/login") ||
            path.startsWith("/api/user/register") ||
            path.startsWith("/api/auth") ||
            request.getMethod().equalsIgnoreCase("OPTIONS")) {

            chain.doFilter(request, response);
            return;
        }

        // Read Authorization header
        String header = request.getHeader("Authorization");

        // If token is missing or invalid format, continue request
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        // Extract token
        String token = header.substring(7);

        String username = null;

        // Extract username from token
        try {
            username = jwtService.extractUsername(token);
        } catch (JwtException e) {
            chain.doFilter(request, response);
            return;
        }

        // Authenticate user if not already authenticated
        if (username != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails user = userService.loadUserByUsername(username);

            // Validate token
            if (jwtService.isTokenValid(token, user)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Set userId in request for later use
                if (user instanceof com.edutech.supply_of_goods_management.entity.User) {
                    com.edutech.supply_of_goods_management.entity.User u =
                            (com.edutech.supply_of_goods_management.entity.User) user;

                    request.setAttribute("userId", u.getId());
                }
            }
        }

        // Continue filter chain
        chain.doFilter(request, response);
    }
}

// @Component
// public class JwtRequestFilter extends OncePerRequestFilter {

//     @Autowired private JwtUtil jwtService;
//     @Autowired private UserService userService;

//     @Override
//     protected void doFilterInternal(HttpServletRequest request,
//                                     HttpServletResponse response,
//                                     FilterChain chain)
//             throws IOException, ServletException {

//         String path = request.getRequestURI();

//         // ✅ 1. Skip login & registration endpoints (no JWT required)
//         if (path.startsWith("/api/user/login") ||
//             path.startsWith("/api/user/register") ||
//             request.getMethod().equalsIgnoreCase("OPTIONS")) {

//             chain.doFilter(request, response);
//             return;
//         }

//         // ✅ 2. Extract Authorization header
//         String header = request.getHeader("Authorization");

//         // ✅ 3. If header missing or not Bearer → just proceed (DO NOT parse)
//         if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
//             chain.doFilter(request, response);
//             return;
//         }

//         // ✅ 4. Extract token
//         String token = header.substring(7);

//         String username = null;

//         try {
//             username = jwtService.extractUsername(token);
//         } catch (JwtException e) {
//             // ✅ Invalid token → skip authentication but DO NOT crash
//             chain.doFilter(request, response);
//             return;
//         }

//         // ✅ 5. Validate token & set authentication
//         if (username != null &&
//             SecurityContextHolder.getContext().getAuthentication() == null) {

//             UserDetails user = userService.loadUserByUsername(username);

//             if (jwtService.isTokenValid(token, user)) {
//                 UsernamePasswordAuthenticationToken authToken =
//                         new UsernamePasswordAuthenticationToken(
//                                 user, null, user.getAuthorities());

//                 SecurityContextHolder.getContext().setAuthentication(authToken);
//             }
//         }

//         chain.doFilter(request, response);
//     }


// }

 


// package com.edutech.supply_of_goods_management.jwt;


// import io.jsonwebtoken.*;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Lazy;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.AuthorityUtils;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.stereotype.Component;
// import org.springframework.util.StringUtils;
// import org.springframework.web.filter.OncePerRequestFilter;

// import com.edutech.supply_of_goods_management.service.UserService;

// import javax.servlet.FilterChain;
// import javax.servlet.ServletException;
// import javax.servlet.http.HttpServletRequest;
// import javax.servlet.http.HttpServletResponse;
// import java.io.IOException;
// import java.util.Collection;



// @Component
// public class JwtRequestFilter extends OncePerRequestFilter {

//     @Autowired private JwtUtil jwtService;
//     @Autowired private UserService userService;

//     @Override
//     protected void doFilterInternal(HttpServletRequest request,
//                                     HttpServletResponse response,
//                                     FilterChain chain) throws IOException, ServletException {

//         String header = request.getHeader("Authorization");

//         if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
//             chain.doFilter(request, response);
//             return;
//         }

//         String token = header.substring(7);
//         String username = jwtService.extractUsername(token);

//         if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//             UserDetails user = userService.loadUserByUsername(username);

//             if (jwtService.isTokenValid(token, user)) {
//                 UsernamePasswordAuthenticationToken authToken =
//                         new UsernamePasswordAuthenticationToken(
//                                 user, null, user.getAuthorities());

//                 SecurityContextHolder.getContext().setAuthentication(authToken);
//             }
//         }

//         chain.doFilter(request, response);
//     }
// }