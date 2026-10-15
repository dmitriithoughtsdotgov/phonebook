package cz.phonebook.security;

import org.springframework.security.oauth2.jwt.Jwt;

/** The authenticated caller, taken from the Keycloak access token. */
public record CurrentUser(String id, String username) {

    public static CurrentUser from(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        return new CurrentUser(jwt.getSubject(), username != null ? username : jwt.getSubject());
    }
}
