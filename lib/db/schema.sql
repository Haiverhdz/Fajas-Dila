-- Esquema inicial de la Fase 4 (auth + persistencia de pedidos).
-- Pegar y correr completo en MySQL Workbench, conectado a la base "railway".

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(64) NOT NULL UNIQUE,
  user_id INT UNSIGNED NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_cedula VARCHAR(20) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  items JSON NOT NULL,
  subtotal INT UNSIGNED NOT NULL,
  shipping_cost INT UNSIGNED NOT NULL,
  total INT UNSIGNED NOT NULL,
  payment_method ENUM('wompi', 'addi') NOT NULL,
  -- 'rejected' y 'abandoned' son estados reales de Addi (confirmados contra
  -- su documentación oficial). 'in_process' no es un estado que Addi envíe.
  status ENUM('pending', 'approved', 'declined', 'in_process', 'rejected', 'abandoned') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Si se borra el usuario, el pedido se conserva (queda como si fuera de invitado)
  -- en vez de desaparecer del historial de ventas.
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
