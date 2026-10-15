package cz.phonebook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String issuer,
        String jwkSetUri,
        String audience,
        List<String> allowedOrigins
) {
}
