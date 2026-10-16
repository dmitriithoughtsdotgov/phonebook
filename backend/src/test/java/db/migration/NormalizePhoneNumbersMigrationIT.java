package db.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

/** Numbers stored before V3 (as the user typed them) are rewritten to E.164; invalid ones are kept. */
@Testcontainers
class NormalizePhoneNumbersMigrationIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void rewritesExistingNumbersToE164() {
        DataSource dataSource = new DriverManagerDataSource(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        flyway(dataSource, "2").migrate();
        jdbc.update("""
                INSERT INTO phone_numbers (number, visibility, owner_id, owner_username, created_at)
                VALUES ('777 123 456', 'PRIVATE', 'a', 'alice', now()),
                       ('+44 20 7946 0958', 'SHARED', 'a', 'alice', now()),
                       ('234234', 'SHARED', 'a', 'alice', now())
                """);

        flyway(dataSource, "3").migrate();

        assertThat(jdbc.queryForList("SELECT number FROM phone_numbers ORDER BY id", String.class))
                .containsExactly("+420777123456", "+442079460958", "234234");
    }

    private static Flyway flyway(DataSource dataSource, String target) {
        return Flyway.configure().dataSource(dataSource).target(target).load();
    }
}
