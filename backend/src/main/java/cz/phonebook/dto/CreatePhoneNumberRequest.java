package cz.phonebook.dto;

import cz.phonebook.entity.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePhoneNumberRequest(
        @NotBlank
        @Pattern(regexp = "^\\s*\\+?[0-9][0-9 ()\\-]{2,30}\\s*$",
                message = "must be a phone number, e.g. +420 777 123 456")
        String number,

        @Size(max = 100)
        String label,

        @NotNull
        Visibility visibility
) {
}
