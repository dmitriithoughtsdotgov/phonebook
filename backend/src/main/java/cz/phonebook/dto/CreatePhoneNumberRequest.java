package cz.phonebook.dto;

import cz.phonebook.entity.Visibility;
import cz.phonebook.validation.ValidPhoneNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePhoneNumberRequest(
        @NotBlank
        @Size(max = 32) // length of the phone_numbers.number column
        @ValidPhoneNumber
        String number,

        @Size(max = 100)
        String label,

        @NotNull
        Visibility visibility
) {
}
