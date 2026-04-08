package com.edutech.supply_of_goods_management.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service responsible for sending OTP emails to users.
 */
@Service
public class EmailService {

    private final JavaMailSender sender; // mail sender provided by Spring Boot

    public EmailService(JavaMailSender sender) {
        this.sender = sender;
    }

    /**
     * Sends an OTP email to the given user email address.
     */
    public void sendOtp(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage(); // simple text email
        msg.setTo(to);                                   // recipient email
        msg.setSubject("Your OTP for Login");            // email subject
        msg.setText("Your OTP is: " + otp + "\nValid for 5 minutes."); // body content
        sender.send(msg);                                // send the email
    }
}