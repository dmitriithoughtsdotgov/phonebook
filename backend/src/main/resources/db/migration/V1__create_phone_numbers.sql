CREATE TABLE phone_numbers
(
    id             BIGSERIAL PRIMARY KEY,
    number         VARCHAR(32)  NOT NULL,
    label          VARCHAR(100),
    visibility     VARCHAR(16)  NOT NULL CHECK (visibility IN ('PRIVATE', 'SHARED')),
    owner_id       VARCHAR(64)  NOT NULL,
    owner_username VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_phone_numbers_owner_id ON phone_numbers (owner_id);
CREATE INDEX idx_phone_numbers_visibility ON phone_numbers (visibility);
