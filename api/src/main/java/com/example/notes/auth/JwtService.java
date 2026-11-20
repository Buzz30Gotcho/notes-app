package com.example.notes.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Génération et validation des jetons JWT (signés en HS256).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ZONE D'ENTRAÎNEMENT 💪 │
 * │ Les valeurs jwt.secret et jwt.expiration-minutes viennent de │
 * │ application.properties et sont déjà injectées ci-dessous. │
 * │ La librairie disponible est io.jsonwebtoken (jjwt 0.12.6). │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@Service
public class JwtService {

    private final String secret;
    private final long expirationMinutes;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-minutes}") long expirationMinutes) {
        this.secret = secret;
        this.expirationMinutes = expirationMinutes;
    }

    /**
     * Construit un JWT pour un utilisateur.
     *
     * Logique :
     * - subject = user.id() (l'identité portée par le token)
     * - claims = email, firstName... (optionnel)
     * - issuedAt = maintenant ; expiration = maintenant + expirationMinutes
     * - signer avec la clé HS256 dérivée de `secret`
     */
    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(user.getId()) // qui est l'utilisateur
                .claim("email", user.getEmail()) // infos en plus (optionnel)
                .issuedAt(Date.from(now)) // date de création
                .expiration(Date.from(expiration)) // date d'expiration
                .signWith(signingKey()) // signature avec la clé secrète
                .compact(); // fabrique la chaîne "xxx.yyy.zzz"
    }

    /** Transforme le secret texte en clé de signature HS256. */
    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Valide la signature + l'expiration d'un token et renvoie le subject (user
     * id).
     * Lève une exception si le token est invalide/expiré.
     */
    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();

    }
}
