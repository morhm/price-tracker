-- Create function to generate tag color based on tag name
CREATE OR REPLACE FUNCTION get_tag_color(tag_name TEXT)
RETURNS TEXT AS $$
DECLARE
  colors TEXT[] := ARRAY['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'];
  hash_value BIGINT;
BEGIN
  -- Simple hash function based on tag name
  hash_value := ascii(substring(tag_name from 1 for 1)) + length(tag_name);
  RETURN colors[(hash_value % array_length(colors, 1)) + 1];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to insert default tags for a new user
CREATE OR REPLACE FUNCTION create_default_tags()
RETURNS TRIGGER AS $$
DECLARE
  default_tags TEXT[] := ARRAY['Clothing', 'Shoes', 'Electronics', 'Music', 'CDs', 'Vintage', 'Denim', 'Furniture', 'Gaming', 'Tools'];
  tag_name TEXT;
BEGIN
  FOREACH tag_name IN ARRAY default_tags
  LOOP
    INSERT INTO "Tag" (name, "userId", color, "createdAt")
    VALUES (tag_name, NEW.id, get_tag_color(tag_name), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after user insert
DROP TRIGGER IF EXISTS create_default_tags_trigger ON "User";
CREATE TRIGGER create_default_tags_trigger
  AFTER INSERT ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION create_default_tags();

-- Add default tags to all existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
  default_tags TEXT[] := ARRAY['Clothing', 'Shoes', 'Electronics', 'Music', 'CDs', 'Vintage', 'Denim', 'Furniture', 'Gaming', 'Tools'];
  tag_name TEXT;
BEGIN
  FOR user_record IN SELECT id FROM "User"
  LOOP
    FOREACH tag_name IN ARRAY default_tags
    LOOP
      INSERT INTO "Tag" (name, "userId", color, "createdAt")
      VALUES (tag_name, user_record.id, get_tag_color(tag_name), NOW())
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;