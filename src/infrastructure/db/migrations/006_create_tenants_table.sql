-- Create tenants table for multitenant management
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  tax_id VARCHAR(50),
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_subscription_plan (subscription_plan),
  UNIQUE KEY unique_business_name (business_name),
  UNIQUE KEY unique_owner_email (owner_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert example tenants
INSERT IGNORE INTO tenants (id, name, business_name, owner_name, owner_email, phone, address, tax_id) VALUES
('paul-store', 'Tienda de Paul', 'Paul\'s Electronics Store', 'Paul Johnson', 'paul@paulstore.com', '+1234567890', '123 Main St, City', 'TAX123456'),
('david-store', 'Tienda de David', 'David\'s Clothing Store', 'David Smith', 'david@davidstore.com', '+0987654321', '456 Oak Ave, Town', 'TAX789012');

-- Add foreign key constraint to users table (if not exists)
-- ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id); 