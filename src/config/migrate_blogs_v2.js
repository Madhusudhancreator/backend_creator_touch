/**
 * migrate_blogs_v2.js — upgrades the blogs table to the full posts schema.
 *
 * Run once after migrate_blogs.js:
 *   node src/config/migrate_blogs_v2.js
 *
 * What it does (all idempotent):
 *   - Renames:  excerpt → description,  img → social_image
 *   - Adds:     body_markdown, body_html, processed_html, canonical_url,
 *               published_at, reading_time, tags_array, cached_tag_list,
 *               author_id, updated_at
 *   - Migrates: old body[]→body_markdown, tag→tags_array/cached_tag_list,
 *               read_time text→reading_time int
 *   - Drops:    tag, read_time, body  (old columns)
 *   - Creates:  updated_at auto-set trigger
 */

require("dotenv").config();
const { query, pool } = require("./db");

async function migrate() {

  // ── 1. Rename simple columns ─────────────────────────────────────────────
  // Use DO blocks so we skip if the column was already renamed.
  await query(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='blogs' AND column_name='excerpt') THEN
        ALTER TABLE blogs RENAME COLUMN excerpt TO description;
      END IF;
    END $$;
  `);

  await query(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='blogs' AND column_name='img') THEN
        ALTER TABLE blogs RENAME COLUMN img TO social_image;
      END IF;
    END $$;
  `);

  // ── 2. Add new columns (IF NOT EXISTS) ──────────────────────────────────
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS body_markdown   TEXT        NOT NULL DEFAULT '';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS body_html       TEXT        NOT NULL DEFAULT '';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS processed_html  TEXT        NOT NULL DEFAULT '';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS canonical_url   TEXT        NOT NULL DEFAULT '';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at    TIMESTAMPTZ;`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS reading_time    INTEGER     NOT NULL DEFAULT 0;`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags_array      TEXT[]      NOT NULL DEFAULT '{}';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cached_tag_list TEXT        NOT NULL DEFAULT '';`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_id       INTEGER;`);
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();`);

  // ── 3. Migrate data from old columns → new columns ──────────────────────

  // body (JSONB array of strings) → body_markdown (newline-joined paragraphs)
  // Guard with jsonb_typeof = 'array' — rows with a JSONB object would otherwise crash.
  await query(`
    UPDATE blogs
       SET body_markdown  = (
             SELECT string_agg(value, E'\\n\\n' ORDER BY ordinality)
             FROM   jsonb_array_elements_text(body) WITH ORDINALITY
           ),
           body_html      = (
             SELECT string_agg('<p>' || value || '</p>', E'\\n' ORDER BY ordinality)
             FROM   jsonb_array_elements_text(body) WITH ORDINALITY
           ),
           processed_html = (
             SELECT string_agg('<p>' || value || '</p>', E'\\n' ORDER BY ordinality)
             FROM   jsonb_array_elements_text(body) WITH ORDINALITY
           )
     WHERE body IS NOT NULL
       AND jsonb_typeof(body) = 'array'
       AND body != '[]'::jsonb
       AND body_markdown = '';
  `);

  // tag (TEXT) → tags_array (TEXT[]) + cached_tag_list (TEXT)
  await query(`
    UPDATE blogs
       SET tags_array      = CASE WHEN tag != '' THEN ARRAY[tag] ELSE '{}' END,
           cached_tag_list = tag
     WHERE tag IS NOT NULL
       AND (tags_array = '{}' OR cached_tag_list = '');
  `);

  // read_time ('5 min read') → reading_time (integer minutes)
  await query(`
    UPDATE blogs
       SET reading_time = COALESCE(
             NULLIF(regexp_replace(COALESCE(read_time, ''), '[^0-9]', '', 'g'), '')::INTEGER,
             0
           )
     WHERE read_time IS NOT NULL AND reading_time = 0;
  `);

  // published_at — backfill from created_at for already-published posts
  await query(`
    UPDATE blogs
       SET published_at = created_at
     WHERE published = TRUE AND published_at IS NULL;
  `);

  // ── 4. Drop old columns ──────────────────────────────────────────────────
  await query(`ALTER TABLE blogs DROP COLUMN IF EXISTS tag;`);
  await query(`ALTER TABLE blogs DROP COLUMN IF EXISTS read_time;`);
  await query(`ALTER TABLE blogs DROP COLUMN IF EXISTS body;`);

  // ── 5. updated_at trigger ────────────────────────────────────────────────
  await query(`
    CREATE OR REPLACE FUNCTION blogs_set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'blogs_updated_at_trigger'
          AND event_object_table = 'blogs'
      ) THEN
        CREATE TRIGGER blogs_updated_at_trigger
          BEFORE UPDATE ON blogs
          FOR EACH ROW EXECUTE FUNCTION blogs_set_updated_at();
      END IF;
    END $$;
  `);

  // ── 6. Extra indexes ─────────────────────────────────────────────────────
  await query(`CREATE INDEX IF NOT EXISTS blogs_published_at_idx  ON blogs (published_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS blogs_published_idx     ON blogs (published);`);

  console.log("✓ blogs table upgraded to v2 schema");
  console.log("  columns : description, social_image, body_markdown, body_html,");
  console.log("            processed_html, canonical_url, published_at, reading_time,");
  console.log("            tags_array, cached_tag_list, author_id, updated_at");
  console.log("  dropped : tag, read_time, body");
  console.log("  trigger : blogs_updated_at_trigger");

  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
