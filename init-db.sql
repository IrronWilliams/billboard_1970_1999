CREATE TABLE IF NOT EXISTS ratings (
  id         BIGSERIAL PRIMARY KEY,
  song       TEXT        NOT NULL,
  artist     TEXT        NOT NULL,
  year       SMALLINT    NOT NULL,
  decade     SMALLINT    NOT NULL,
  vote       TEXT        NOT NULL CHECK (vote IN ('up', 'down')),
  ip         TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ratings_song_ip_uq UNIQUE (song, artist, ip)
);

CREATE INDEX IF NOT EXISTS ratings_song_artist_idx ON ratings (song, artist);
