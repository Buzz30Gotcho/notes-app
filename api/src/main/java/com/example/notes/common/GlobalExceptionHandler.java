package com.example.notes.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.notes.auth.EmailAlreadyUsedException;

/**
 * Traduit les exceptions en réponses HTTP conformes au contrat (schéma Error).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Échec de validation (@Valid) ou corps JSON illisible -> 400. */
    @ExceptionHandler({ MethodArgumentNotValidException.class, HttpMessageNotReadableException.class })
    public ResponseEntity<ErrorResponse> handleInvalidPayload(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Les données envoyées sont invalides."));
    }

    /** E-mail déjà utilisé -> 409. */
    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyUsed(EmailAlreadyUsedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage()));
    }
}
