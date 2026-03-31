package com.edutech.supply_of_goods_management.controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.supply_of_goods_management.entity.InviteCode;
import com.edutech.supply_of_goods_management.repository.InviteCodeRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final InviteCodeRepository inviteRepo;
    private final PasswordEncoder encoder;

    public AdminController(InviteCodeRepository inviteRepo,
                           PasswordEncoder encoder) {
        this.inviteRepo = inviteRepo;
        this.encoder = encoder;
    }

    @PostMapping("/generate-invite")
    public Map<String, String> generateInvite(@RequestParam String role) {

        String rawCode = UUID.randomUUID().toString();

        InviteCode invite = new InviteCode();
        invite.setRole(role);
        invite.setCodeHash(encoder.encode(rawCode));
        invite.setUsed(false);
        invite.setExpiresAt(LocalDateTime.now().plusDays(1));

        inviteRepo.save(invite);

        return Map.of("code", rawCode);
    }
}