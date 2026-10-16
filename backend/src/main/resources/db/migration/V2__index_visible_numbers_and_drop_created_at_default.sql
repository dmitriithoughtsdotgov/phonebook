-- The list query is "shared OR owned by me, newest first". A plain index on a two-value
-- visibility column is never selective; these two cover both branches including the ordering.
DROP INDEX idx_phone_numbers_visibility;
DROP INDEX idx_phone_numbers_owner_id;

CREATE INDEX idx_phone_numbers_shared_created ON phone_numbers (created_at DESC, id DESC)
    WHERE visibility = 'SHARED';
CREATE INDEX idx_phone_numbers_owner_created ON phone_numbers (owner_id, created_at DESC, id DESC);

-- The application is the single source of created_at (see the PhoneNumber entity).
ALTER TABLE phone_numbers ALTER COLUMN created_at DROP DEFAULT;
