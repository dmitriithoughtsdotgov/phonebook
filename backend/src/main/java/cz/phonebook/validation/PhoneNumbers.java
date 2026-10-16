package cz.phonebook.validation;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import java.util.Optional;

/** Parsing and normalisation of phone numbers by real numbering plans (Google libphonenumber). */
public final class PhoneNumbers {

    /** ISO 3166 country code assumed for numbers written without an international prefix. */
    public static final String DEFAULT_REGION = "CZ";

    private static final PhoneNumberUtil UTIL = PhoneNumberUtil.getInstance();

    private PhoneNumbers() {
    }

    /** The number if it is a real one, read in {@code defaultRegion} when it has no +prefix. */
    public static Optional<PhoneNumber> parse(String raw, String defaultRegion) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        try {
            PhoneNumber number = UTIL.parse(raw.trim(), defaultRegion);
            return UTIL.isValidNumber(number) ? Optional.of(number) : Optional.empty();
        } catch (NumberParseException e) {
            return Optional.empty();
        }
    }

    /**
     * The canonical E.164 form ({@code +420777123456}), so that one number is stored the same way
     * however it was typed. Formatting for people is left to the UI.
     *
     * @throws IllegalArgumentException if the value is not a real phone number
     */
    public static String toE164(String raw) {
        return parse(raw, DEFAULT_REGION)
                .map(number -> UTIL.format(number, PhoneNumberFormat.E164))
                .orElseThrow(() -> new IllegalArgumentException("Not a valid phone number: " + raw));
    }
}
