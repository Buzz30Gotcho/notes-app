package com.example.notes.auth;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.notes.auth.dto.AuthResponse;
import com.example.notes.auth.dto.RegisterRequest;
import com.example.notes.auth.dto.UserResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException();
        }
        User user = new User(
                UUID.randomUUID().toString(),
                request.firstName(),
                request.lastName(),
                email,
                passwordEncoder.encode(request.password()));
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer",
                new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail()));
    }
    /**
     * INSCRIPTION — crée un compte puis renvoie un jeton d'accès et le profil créé.
     *
     * Logique à implémenter :
     * 1. Normaliser l'e-mail (toLowerCase).
     * 2. Si userRepository.existsByEmail(email) -> throw EmailAlreadyUsedException.
     * 3. Créer un User (id = UUID.randomUUID().toString(), mot de passe HASHÉ
     * avec passwordEncoder.encode(...)), puis userRepository.save(user).
     * 4. Générer un vrai JWT (jwtService.generateToken(user)).
     * 5. Retourner new AuthResponse(token, "Bearer", <UserResponse sans mot de
     * passe>).
     *
     * @throws EmailAlreadyUsedException si l'e-mail est déjà utilisé (-> HTTP 409)
     */

    /**
     * CONNEXION — vérifie l'e-mail + mot de passe puis renvoie un JWT.
     *
     * Logique à implémenter :
     * 1. Normaliser l'e-mail, charger l'utilisateur via findByEmail(email).
     * 2. Si absent OU si passwordEncoder.matches(request.password(),
     * user.passwordHash())
     * est faux -> throw InvalidCredentialsException (à créer -> HTTP 401).
     * (Même exception dans les deux cas : on ne révèle pas si l'e-mail existe.)
     * 3. Générer un JWT et retourner un AuthResponse comme pour l'inscription.
     *
     * NB : tu devras créer un DTO LoginRequest (email + password).
     */
    // public AuthResponse login(LoginRequest request) {
    // // TODO : à toi de l'écrire.
    // }
}
