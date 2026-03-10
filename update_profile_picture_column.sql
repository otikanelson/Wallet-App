-- Update profilePicture column to support larger base64 images
ALTER TABLE users MODIFY COLUMN profilePicture LONGTEXT NOT NULL;
