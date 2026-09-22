-- Agrega los estados reales de Addi ('rejected', 'abandoned') al ENUM de
-- orders.status, que originalmente solo tenía 'pending', 'approved',
-- 'declined', 'in_process'. Correr en Workbench, conectado a la base
-- "railway" (no se ejecutó automáticamente — requiere confirmación manual).

ALTER TABLE orders
  MODIFY COLUMN status ENUM('pending', 'approved', 'declined', 'in_process', 'rejected', 'abandoned')
  NOT NULL DEFAULT 'pending';
