package cz.phonebook;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end check of the core business rule against a real PostgreSQL (with Flyway migrations):
 * private numbers are visible only to their owner, shared numbers to everyone.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class PhoneNumberVisibilityIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    MockMvc mvc;

    @Test
    void privateNumbersAreVisibleOnlyToOwnerAndSharedToEveryone() throws Exception {
        create(user("alice-id", "alice"), "+420 777 111 222", "PRIVATE");
        create(user("alice-id", "alice"), "+420 602 333 444", "SHARED");
        create(user("bob-id", "bob"), "+420 731 555 666", "PRIVATE");

        mvc.perform(get("/api/phones").with(user("alice-id", "alice")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].number", containsInAnyOrder("+420 777 111 222", "+420 602 333 444")));

        mvc.perform(get("/api/phones").with(user("bob-id", "bob")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].number", containsInAnyOrder("+420 731 555 666", "+420 602 333 444")))
                .andExpect(jsonPath("$[?(@.number == '+420 602 333 444')].ownerUsername", contains("alice")))
                .andExpect(jsonPath("$[?(@.number == '+420 602 333 444')].mine", contains(false)));
    }

    private void create(RequestPostProcessor user, String number, String visibility) throws Exception {
        mvc.perform(post("/api/phones").with(user)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"number": "%s", "visibility": "%s"}
                                """.formatted(number, visibility)))
                .andExpect(status().isCreated());
    }

    private static RequestPostProcessor user(String id, String username) {
        return jwt().jwt(j -> j.subject(id).claim("preferred_username", username));
    }
}
