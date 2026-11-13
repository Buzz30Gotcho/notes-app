package com.example.notes.auth;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

/**
 * Stockage en mémoire des utilisateurs (suffisant pour cette première tranche
 * et pour une CI sans base de données). L'e-mail est normalisé en minuscules.
 */
@Repository
public class InMemoryUserRepository implements UserRepository {

    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();

    @Override
    public boolean existsByEmail(String email) {
        return usersByEmail.containsKey(email.toLowerCase());
    }

    @Override
    public User save(User user) {
        usersByEmail.put(user.email().toLowerCase(), user);
        return user;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(usersByEmail.get(email.toLowerCase()));
    }
}
