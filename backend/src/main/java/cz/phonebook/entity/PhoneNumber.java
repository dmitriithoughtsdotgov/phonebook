package cz.phonebook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * A stored phone number. Records are immutable by design: the application only
 * supports creating and reading them, so the entity exposes no setters.
 */
@Entity
@Table(name = "phone_numbers")
public class PhoneNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Always in E.164 form, e.g. {@code +420777123456}. */
    @Column(nullable = false, length = 32, updatable = false)
    private String number;

    @Column(length = 100, updatable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16, updatable = false)
    private Visibility visibility;

    @Column(name = "owner_id", nullable = false, length = 64, updatable = false)
    private String ownerId;

    @Column(name = "owner_username", nullable = false, updatable = false)
    private String ownerUsername;

    /** Set by the application only; the column deliberately has no database default. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PhoneNumber() {
        // for JPA
    }

    public PhoneNumber(String number, String label, Visibility visibility, String ownerId, String ownerUsername) {
        this.number = number;
        this.label = label;
        this.visibility = visibility;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getNumber() {
        return number;
    }

    public String getLabel() {
        return label;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
