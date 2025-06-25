-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'cashier', 'viewer') NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id, tenant_id),
  UNIQUE KEY unique_email_tenant (email, tenant_id),
  UNIQUE KEY unique_id_tenant (id, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create roles table for reference
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  tenant_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id, tenant_id),
  UNIQUE KEY unique_role_name_tenant (name, tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
('admin', 'admin', 'Administrator with full access', 'default'),
('manager', 'manager', 'Manager with limited administrative access', 'default'),
('cashier', 'cashier', 'Cashier with sales access', 'default'),
('viewer', 'viewer', 'Viewer with read-only access', 'default'); 