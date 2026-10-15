package cz.phonebook.dto;

import cz.phonebook.entity.PhoneNumber;
import cz.phonebook.entity.Visibility;
import cz.phonebook.security.CurrentUser;

import java.time.Instant;

public record PhoneNumberResponse(
        Long id,
        String number,
        String label,
        Visibility visibility,
        String ownerUsername,
        boolean mine,
        Instant createdAt
) {

    public static PhoneNumberResponse of(PhoneNumber p, CurrentUser user) {
        return new PhoneNumberResponse(p.getId(), p.getNumber(), p.getLabel(), p.getVisibility(),
                p.getOwnerUsername(), p.getOwnerId().equals(user.id()), p.getCreatedAt());
    }
}
