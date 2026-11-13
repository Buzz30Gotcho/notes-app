package com.example.notes.auth;

/**
 * Levée quand on tente de créer un compte avec un e-mail déjà enregistré.
 * Traduite en réponse HTTP 409 par le GlobalExceptionHandler.
 */
public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}
