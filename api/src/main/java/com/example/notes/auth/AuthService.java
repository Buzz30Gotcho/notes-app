package com.example.notes.auth;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.notes.auth.dto.AuthResponse;
import com.example.notes.auth.dto.RegisterRequest;
import com.example.notes.auth.dto.UserResponse;

/**
 * Logique métier de l'authentification.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Crée un compte puis renvoie un jeton d'accès et le profil créé.
     *
     * @throws EmailAlreadyUsedException si l'e-mail est déjà utilisé (-> HTTP 409)
     */
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException("Cette adresse e-mail est déjà utilisée.");
        }

        User user = new User(
                UUID.randomUUID().toString(),
                request.firstName(),
                request.lastName(),
                email,
                passwordEncoder.encode(request.password()));
        userRepository.save(user);

        UserResponse userResponse = new UserResponse(
                user.id(), user.firstName(), user.lastName(), user.email());

        // TODO: remplacer par un vrai JWT lors de la tranche "login / sécurité".
        String accessToken = UUID.randomUUID().toString();
        return new AuthResponse(accessToken, "Bearer", userResponse);
    }
}
