package com.edutech.supply_of_goods_management.dto;

import java.time.LocalDateTime;

/**
 * Simple DTO used to send structured error responses to the frontend.
 * Helps the UI display clear and consistent error messages.
 */
public class ApiError {

    // When the error happened
    private LocalDateTime timestamp;

    // HTTP status code (e.g., 400, 401, 404, 500)
    private int status;

    // Short error description (e.g., "Bad Request")
    private String error;

    // Detailed message about what went wrong
    private String message;

    // The API path where the error occurred
    private String path;

    // Default constructor
    public ApiError() {}

    // Constructor to quickly create an error object
    public ApiError(LocalDateTime timestamp, int status, String error, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Getters & setters for all fields
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}