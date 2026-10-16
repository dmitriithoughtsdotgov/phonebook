package cz.phonebook.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private String defaultRegion;

    @Override
    public void initialize(ValidPhoneNumber annotation) {
        this.defaultRegion = annotation.defaultRegion();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // left to @NotBlank
        }
        return PhoneNumbers.parse(value, defaultRegion).isPresent();
    }
}
