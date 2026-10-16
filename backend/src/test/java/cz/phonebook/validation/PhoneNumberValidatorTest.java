package cz.phonebook.validation;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class PhoneNumberValidatorTest {

    record Holder(@ValidPhoneNumber String number) {
    }

    static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "+420 777 123 456",
            "777 123 456",
            "777123456",
            "00420 777 123 456",
            "  +420 602 333 444  ",
            "+44 20 7946 0958",
            "+1 650 253 0000",
    })
    void acceptsRealNumbers(String number) {
        assertThat(validator.validate(new Holder(number))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "234234",
            "+420 123 456 789",
            "+420 777 12",
            "777 123 456 7",
            "not a number",
    })
    void rejectsInvalidNumbers(String number) {
        assertThat(validator.validate(new Holder(number))).hasSize(1);
    }

    @ParameterizedTest
    @NullAndEmptySource
    void leavesMissingValuesToNotBlank(String number) {
        assertThat(validator.validate(new Holder(number))).isEmpty();
    }
}
