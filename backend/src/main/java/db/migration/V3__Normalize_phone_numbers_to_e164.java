package db.migration;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Rewrites numbers stored as the user typed them into E.164, which the application stores since.
 * Self-contained on purpose (no application classes), so later code changes cannot alter what
 * this already-applied migration does.
 */
public class V3__Normalize_phone_numbers_to_e164 extends BaseJavaMigration {

    private static final Logger log = LoggerFactory.getLogger(V3__Normalize_phone_numbers_to_e164.class);

    @Override
    public void migrate(Context context) throws Exception {
        PhoneNumberUtil util = PhoneNumberUtil.getInstance();
        try (Statement select = context.getConnection().createStatement();
             ResultSet rows = select.executeQuery("SELECT id, number FROM phone_numbers");
             PreparedStatement update = context.getConnection()
                     .prepareStatement("UPDATE phone_numbers SET number = ? WHERE id = ?")) {
            while (rows.next()) {
                long id = rows.getLong("id");
                String number = rows.getString("number");
                try {
                    PhoneNumber parsed = util.parse(number.trim(), "CZ");
                    if (!util.isValidNumber(parsed)) {
                        log.warn("Phone number {} is not valid, left unchanged", id);
                        continue;
                    }
                    update.setString(1, util.format(parsed, PhoneNumberFormat.E164));
                    update.setLong(2, id);
                    update.addBatch();
                } catch (NumberParseException e) {
                    log.warn("Phone number {} cannot be parsed, left unchanged", id);
                }
            }
            update.executeBatch();
        }
    }
}
