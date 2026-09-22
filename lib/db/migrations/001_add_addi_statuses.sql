-- Ajusta orders.status al enum interno final ('abandoned' y 'error' son
-- estados reales de Addi sin equivalente en Wompi; el original solo tenía
-- 'pending', 'approved', 'declined', 'in_process') y agrega addi_status,
-- una columna nueva para guardar el estado CRUDO que manda Addi en el
-- webhook (confirmado contra su documentación oficial: son exactamente
-- estos 6 valores). Correr en Workbench, conectado a la base "railway"
-- (no se ejecutó automáticamente — requiere confirmación manual).

ALTER TABLE orders
  MODIFY COLUMN status ENUM('pending', 'approved', 'declined', 'in_process', 'abandoned', 'error')
  NOT NULL DEFAULT 'pending';

ALTER TABLE orders
  ADD COLUMN addi_status ENUM('APPROVED', 'PENDING', 'REJECTED', 'ABANDONED', 'DECLINED', 'INTERNAL_ERROR') NULL
  AFTER status;
