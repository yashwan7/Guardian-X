package com.guardianota;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuardianBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuardianBackendApplication.class, args);
    }
}
