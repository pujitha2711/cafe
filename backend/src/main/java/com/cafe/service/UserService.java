package com.cafe.service;

import com.cafe.config.JwtUtils;
import com.cafe.dto.*;
import com.cafe.entity.User;
import com.cafe.entity.UserRole;
import com.cafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    // Helper to generate 6-digit OTP
    private String generateOtp() {
        Random rnd = new Random();
        int number = rnd.nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    public MessageResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Error: Email is already registered!");
        }

        // Admin creation backdoor: if email ends with admin@cafe.com, automatically grant ROLE_ADMIN
        UserRole role = UserRole.ROLE_CUSTOMER;
        if (request.getEmail().toLowerCase().endsWith("admin@cafe.com") || request.getEmail().toLowerCase().equals("admin@gmail.com")) {
            role = UserRole.ROLE_ADMIN;
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isVerified(true)
                .verificationCode(null)
                .build();

        userRepository.save(user);

        return new MessageResponse("User registered successfully! You can now log in.");
    }

    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getFullName(), user.getId());

        return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.isVerified());
    }

    public MessageResponse verifyEmail(VerifyRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new MessageResponse("Error: User not found!");
        }

        User user = userOpt.get();
        if (user.isVerified()) {
            return new MessageResponse("Account is already verified.");
        }

        if (user.getVerificationCode() != null && user.getVerificationCode().equals(request.getCode())) {
            user.setVerified(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return new MessageResponse("Account verified successfully! You can now log in.");
        }

        return new MessageResponse("Error: Invalid verification code!");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new MessageResponse("Error: If email exists, reset code is dispatched.");
        }

        User user = userOpt.get();
        String resetCode = generateOtp();
        user.setVerificationCode(resetCode);
        userRepository.save(user);

        // Simulated Email System: Print recovery code to console log
        System.out.println("=================================================");
        System.out.println("SIMULATED EMAIL TO: " + request.getEmail());
        System.out.println("Subject: Password Reset Verification Code");
        System.out.println("Your 6-digit reset code is: " + resetCode);
        System.out.println("=================================================");

        return new MessageResponse("Password reset code sent to your email (check console logs).");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new MessageResponse("Error: User not found!");
        }

        User user = userOpt.get();
        if (user.getVerificationCode() != null && user.getVerificationCode().equals(request.getCode())) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setVerificationCode(null);
            userRepository.save(user);
            return new MessageResponse("Password reset successfully! You can now log in with your new password.");
        }

        return new MessageResponse("Error: Invalid or expired reset code!");
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
