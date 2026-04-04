package com.edutech.supply_of_goods_management.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender sender;

    public EmailService(JavaMailSender sender) {
        this.sender = sender;
    }

    public void sendOtp(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Your OTP for Login");
        msg.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");
        sender.send(msg);
    }
}