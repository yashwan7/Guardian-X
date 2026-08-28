package com.guardianota.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage());
        String message = ex.getMessage();
        int status = message != null && message.contains("not found") ? 404 : 500;
        return ResponseEntity.status(status).body(Map.of(
                "error", ex.getMessage() != null ? ex.getMessage() : "Internal server error",
                "status", status,
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error",
                "status", 500,
                "timestamp", Instant.now().toString()
        ));
    }
}
