package com.example.notes.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository Spring Data JPA pour les utilisateurs.
 * Spring génère l'implémentation : save(), findById()... sont fournis par
 * JpaRepository, et les requêtes de existsByEmail / findByEmail sont déduites
 * du nom des méthodes.
 */
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
