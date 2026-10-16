package cz.phonebook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String issuer,
        String jwkSetUri,
        String audience
) {
}
