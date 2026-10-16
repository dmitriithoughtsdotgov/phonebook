package cz.phonebook.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * A real phone number by the numbering rules of its country (Google libphonenumber).
 * Numbers without an international prefix are read as belonging to {@link #defaultRegion()}.
 * {@code null} is considered valid, combine with {@code @NotBlank} to make the value required.
 */
@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {

    String message() default "must be a valid phone number, e.g. +420 777 123 456";

    /** ISO 3166 country code used for numbers written without a +prefix. */
    String defaultRegion() default PhoneNumbers.DEFAULT_REGION;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
