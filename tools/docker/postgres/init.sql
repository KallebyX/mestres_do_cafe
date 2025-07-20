-- Mestres do Café Enterprise - Database Initialization
-- Arquivo de inicialização do PostgreSQL

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Configurar encoding
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Database Mestres do Café Enterprise initialized successfully at %', now();
END $$; 