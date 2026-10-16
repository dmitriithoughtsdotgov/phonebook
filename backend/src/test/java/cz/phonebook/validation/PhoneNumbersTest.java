package cz.phonebook.validation;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

class PhoneNumbersTest {

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "+420 777 123 456   | +420777123456",
            "777 123 456        | +420777123456",
            "777123456          | +420777123456",
            "00420 777 123 456  | +420777123456",
            "'  +420 602 333 444 ' | +420602333444",
            "+44 20 7946 0958   | +442079460958",
            "+1 (650) 253-0000  | +16502530000",
    })
    void normalisesToE164(String typed, String e164) {
        assertThat(PhoneNumbers.toE164(typed)).isEqualTo(e164);
    }

    @ParameterizedTest
    @ValueSource(strings = {"234234", "+420 123 456 789", "not a number", " "})
    void rejectsInvalidNumbers(String typed) {
        assertThatIllegalArgumentException().isThrownBy(() -> PhoneNumbers.toE164(typed));
    }
}
