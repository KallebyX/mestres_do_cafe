-- Mestres do Café - Database Initialization Script
-- PostgreSQL database setup with UUID extension

-- =============================================================================
-- Enable UUID Extension
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Enable pgcrypto Extension (for password hashing)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Database Optimization Settings
-- =============================================================================
-- These settings are applied automatically by PostgreSQL
-- but can be customized for production

-- Performance settings (commented for development)
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';
-- ALTER SYSTEM SET default_statistics_target = 100;

-- =============================================================================
-- User and Permissions (if needed)
-- =============================================================================
-- The user 'kalleby' should already exist and have proper permissions
-- But we can ensure the database ownership is correct

-- Make sure kalleby owns the database
-- ALTER DATABASE mestres_cafe OWNER TO kalleby;

-- =============================================================================
-- Connection Settings
-- =============================================================================
-- Set timezone to Brazil (São Paulo)
SET timezone = 'America/Sao_Paulo';

-- Set default encoding
SET client_encoding = 'UTF8';

-- =============================================================================
-- Initial Data (if needed)
-- =============================================================================
-- This script only sets up the basic database structure
-- The Flask app will create the tables using SQLAlchemy

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Mestres do Café database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Timezone set to: America/Sao_Paulo';
    RAISE NOTICE 'Ready for Flask SQLAlchemy table creation';
END $$;