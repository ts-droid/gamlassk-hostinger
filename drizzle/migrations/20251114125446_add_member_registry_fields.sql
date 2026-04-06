-- Add member registry fields to users table
ALTER TABLE users ADD COLUMN personnummer VARCHAR(13) UNIQUE;
ALTER TABLE users ADD COLUMN streetAddress TEXT;
ALTER TABLE users ADD COLUMN postalCode VARCHAR(10);
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN joinYear INT;
ALTER TABLE users ADD COLUMN memberType ENUM('ordinarie', 'hedersmedlem', 'stodmedlem') DEFAULT 'ordinarie';
ALTER TABLE users ADD COLUMN paymentStatus ENUM('paid', 'unpaid', 'exempt') DEFAULT 'unpaid';
ALTER TABLE users ADD COLUMN paymentYear INT;
ALTER TABLE users ADD COLUMN showInDirectory INT NOT NULL DEFAULT 1;

-- Add unique constraint to membershipNumber if not exists
ALTER TABLE users MODIFY COLUMN membershipNumber VARCHAR(50) UNIQUE;
