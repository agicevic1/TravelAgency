CREATE DATABASE IF NOT EXISTS travelplusnovo;
USE travelplusnovo;

CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  customer_type ENUM('individual', 'corporate') NOT NULL DEFAULT 'individual',
  service_tier ENUM('standard', 'premium') NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type ENUM('hotel', 'airline', 'transport', 'insurance') NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  season ENUM('summer', 'winter', 'year_round'),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  destination_id INT,
  type ENUM('package', 'cruise', 'business_travel', 'custom') NOT NULL,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  season VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  season VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  planned_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  planned_expenses DECIMAL(12,2) NOT NULL DEFAULT 0,
  marketing_budget DECIMAL(12,2) DEFAULT 0,
  operations_budget DECIMAL(12,2) DEFAULT 0,
  status ENUM('draft', 'approved', 'active', 'closed') NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  product_id INT,
  booking_date DATE NOT NULL,
  travel_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  number_of_travelers INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL,
  supplier_id INT,
  category ENUM('accommodation', 'transport', 'marketing', 'operations', 'staff', 'other') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS revenues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL,
  booking_id INT,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'bank_transfer') NOT NULL,
  payment_date DATE NOT NULL,
  revenue_type ENUM('booking', 'service_fee', 'insurance', 'other') NOT NULL DEFAULT 'booking',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cost_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  branch_name VARCHAR(255) NOT NULL,
  expense_id INT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  allocation_percentage DECIMAL(5,2),
  period VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tier_name VARCHAR(50) UNIQUE NOT NULL,
  response_time_minutes INT NOT NULL DEFAULT 30,
  change_policy_hours INT NOT NULL DEFAULT 24,
  support_availability VARCHAR(100) NOT NULL DEFAULT 'business_hours',
  includes_insurance BOOLEAN DEFAULT false,
  includes_wifi BOOLEAN DEFAULT false,
  includes_medical_support BOOLEAN DEFAULT false,
  price_modifier DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_contracts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  booking_id INT,
  service_level_id INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'active', 'completed', 'violated') NOT NULL DEFAULT 'draft',
  agreed_response_time INT,
  agreed_availability VARCHAR(100),
  digital_signature VARCHAR(255),
  terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signed_at TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (service_level_id) REFERENCES service_levels(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_requirements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requirement_title VARCHAR(255) NOT NULL,
  destination_id INT,
  requested_by VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status ENUM('submitted', 'evaluating', 'approved', 'rejected', 'implemented') NOT NULL DEFAULT 'submitted',
  estimated_cost DECIMAL(10,2),
  feasibility ENUM('feasible', 'not_feasible', 'needs_review'),
  evaluation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evaluated_at TIMESTAMP NULL,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ola_agreements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agreement_number VARCHAR(50) UNIQUE NOT NULL,
  service_owner VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  agreed_metrics JSON,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'active', 'expired') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_incidents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  booking_id INT NOT NULL,
  sla_contract_id INT,
  incident_type ENUM('flight_delay', 'accommodation_issue', 'medical', 'document_issue', 'other') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  description TEXT NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_time_minutes INT,
  resolved_at TIMESTAMP NULL,
  resolution_notes TEXT,
  status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  sla_met BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (sla_contract_id) REFERENCES sla_contracts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  metric_date DATE NOT NULL DEFAULT (CURDATE()),
  supplier_id INT,
  destination_id INT,
  metric_type ENUM('customer_satisfaction', 'response_time', 'incident_rate', 'sla_compliance') NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  unit ENUM('percentage', 'minutes', 'count', 'score') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_product ON bookings(product_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_expenses_budget ON expenses(budget_id);
CREATE INDEX idx_revenues_budget ON revenues(budget_id);
CREATE INDEX idx_revenues_customer ON revenues(customer_id);
CREATE INDEX idx_incidents_booking ON service_incidents(booking_id);
CREATE INDEX idx_incidents_status ON service_incidents(status);
CREATE INDEX idx_sla_contracts_customer ON sla_contracts(customer_id);
CREATE INDEX idx_metrics_date ON service_metrics(metric_date);
