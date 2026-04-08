package com.edutech.supply_of_goods_management.exception;

import com.edutech.supply_of_goods_management.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

/**
 * Handles all exceptions in one place and returns a clean API error response.
 * Makes error messages consistent and easier for the frontend to display.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Helper method to build a structured ApiError response.
     */
    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest req) {
        ApiError err = new ApiError(
                LocalDateTime.now(),               // when the error happened
                status.value(),                    // HTTP status code
                status.getReasonPhrase(),          // short error name
                message,                           // full error message
                req.getRequestURI()                // which API caused the error
        );
        return ResponseEntity.status(status).body(err);
    }

    /**
     * Handles invalid inputs or bad arguments passed by the user.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    /**
     * Handles forbidden actions (user tries to access restricted resources).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Access denied", req);
    }

    /**
     * Handles validation errors (e.g., @Valid failures in request body).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Validation failed", req);
    }

    /**
     * Handles cases where the API endpoint does not exist.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NoHandlerFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Endpoint not found", req);
    }

    /**
     * Handles unexpected runtime errors thrown during execution.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    /**
     * Handles any other unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAny(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", req);
    }
}