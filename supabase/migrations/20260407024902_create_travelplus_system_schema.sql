/*
  # TravelPlus Turistička Agencija - Informacioni Sistem
  
  Implementacija ITIL procesa za turističku agenciju:
  - Finansijsko upravljanje (Budgeting, Accounting, Charging)
  - Upravljanje nivoom usluga (SLM)
  
  ## 1. Osnovne Tabele
  
  ### `customers` - Klijenti agencije
  - `id` (uuid, primary key)
  - `name` (text) - Ime i prezime
  - `email` (text, unique)
  - `phone` (text)
  - `customer_type` (text) - 'individual' ili 'corporate'
  - `service_tier` (text) - 'standard' ili 'premium'
  - `created_at` (timestamptz)
  
  ### `suppliers` - Dobavljači (hoteli, avioprevoznici)
  - `id` (uuid, primary key)
  - `name` (text)
  - `type` (text) - 'hotel', 'airline', 'transport', 'insurance'
  - `contact_email` (text)
  - `contact_phone` (text)
  - `country` (text)
  - `created_at` (timestamptz)
  
  ### `destinations` - Turističke destinacije
  - `id` (uuid, primary key)
  - `name` (text)
  - `country` (text)
  - `season` (text) - 'summer', 'winter', 'year_round'
  - `description` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### `products` - Turistički proizvodi/aranžmani
  - `id` (uuid, primary key)
  - `name` (text)
  - `destination_id` (uuid, foreign key)
  - `type` (text) - 'package', 'cruise', 'business_travel', 'custom'
  - `base_price` (decimal)
  - `season` (text)
  - `description` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ## 2. Finansijsko Upravljanje
  
  ### `budgets` - Sezonski budžeti
  - `id` (uuid, primary key)
  - `season` (text) - 'spring_2024', 'summer_2024', etc.
  - `year` (integer)
  - `planned_revenue` (decimal)
  - `planned_expenses` (decimal)
  - `marketing_budget` (decimal)
  - `operations_budget` (decimal)
  - `status` (text) - 'draft', 'approved', 'active', 'closed'
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `expenses` - Rashodi
  - `id` (uuid, primary key)
  - `budget_id` (uuid, foreign key)
  - `supplier_id` (uuid, foreign key, nullable)
  - `category` (text) - 'accommodation', 'transport', 'marketing', 'operations', 'staff', 'other'
  - `description` (text)
  - `amount` (decimal)
  - `expense_date` (date)
  - `payment_status` (text) - 'pending', 'paid', 'overdue'
  - `created_at` (timestamptz)
  
  ### `revenues` - Prihodi
  - `id` (uuid, primary key)
  - `budget_id` (uuid, foreign key)
  - `booking_id` (uuid, foreign key, nullable)
  - `customer_id` (uuid, foreign key)
  - `amount` (decimal)
  - `payment_method` (text) - 'cash', 'card', 'bank_transfer'
  - `payment_date` (date)
  - `revenue_type` (text) - 'booking', 'service_fee', 'insurance', 'other'
  - `created_at` (timestamptz)
  
  ### `cost_allocations` - Alokacija troškova po poslovnicama
  - `id` (uuid, primary key)
  - `branch_name` (text) - Naziv poslovnice
  - `expense_id` (uuid, foreign key)
  - `allocated_amount` (decimal)
  - `allocation_percentage` (decimal)
  - `period` (text) - 'Q1_2024', 'Q2_2024', etc.
  - `created_at` (timestamptz)
  
  ### `bookings` - Rezervacije
  - `id` (uuid, primary key)
  - `booking_number` (text, unique)
  - `customer_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `booking_date` (date)
  - `travel_date` (date)
  - `status` (text) - 'pending', 'confirmed', 'cancelled', 'completed'
  - `total_price` (decimal)
  - `cost_price` (decimal) - Trošak dobavljača
  - `net_profit` (decimal) - Marža agencije
  - `number_of_travelers` (integer)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## 3. Upravljanje Nivoom Usluga (SLM)
  
  ### `service_levels` - Definicija nivoa usluga
  - `id` (uuid, primary key)
  - `tier_name` (text) - 'standard', 'premium'
  - `response_time_minutes` (integer) - Vreme odziva u hitnim situacijama
  - `change_policy_hours` (integer) - Rok za besplatnu promenu termina
  - `support_availability` (text) - '24/7', 'business_hours'
  - `includes_insurance` (boolean)
  - `includes_wifi` (boolean)
  - `includes_medical_support` (boolean)
  - `price_modifier` (decimal) - Procenat dodatka na cenu
  - `description` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### `sla_contracts` - SLA ugovori sa klijentima
  - `id` (uuid, primary key)
  - `contract_number` (text, unique)
  - `customer_id` (uuid, foreign key)
  - `booking_id` (uuid, foreign key, nullable)
  - `service_level_id` (uuid, foreign key)
  - `start_date` (date)
  - `end_date` (date)
  - `status` (text) - 'draft', 'active', 'completed', 'violated'
  - `agreed_response_time` (integer)
  - `agreed_availability` (text)
  - `digital_signature` (text) - Hash potpisa
  - `terms` (text)
  - `created_at` (timestamptz)
  - `signed_at` (timestamptz, nullable)
  
  ### `service_requirements` - Zahtevi za novim uslugama
  - `id` (uuid, primary key)
  - `requirement_title` (text)
  - `destination_id` (uuid, foreign key, nullable)
  - `requested_by` (text) - Email ili ID korisnika
  - `description` (text)
  - `priority` (text) - 'low', 'medium', 'high', 'critical'
  - `status` (text) - 'submitted', 'evaluating', 'approved', 'rejected', 'implemented'
  - `estimated_cost` (decimal, nullable)
  - `feasibility` (text) - 'feasible', 'not_feasible', 'needs_review'
  - `evaluation_notes` (text)
  - `created_at` (timestamptz)
  - `evaluated_at` (timestamptz, nullable)
  
  ### `ola_agreements` - Operativni ugovori (interno)
  - `id` (uuid, primary key)
  - `agreement_number` (text, unique)
  - `service_owner` (text) - Odgovorna osoba/sektor
  - `description` (text)
  - `agreed_metrics` (jsonb) - Dogovorene metrike
  - `start_date` (date)
  - `end_date` (date)
  - `status` (text) - 'draft', 'active', 'expired'
  - `created_at` (timestamptz)
  
  ### `service_incidents` - Incidenti tokom putovanja
  - `id` (uuid, primary key)
  - `incident_number` (text, unique)
  - `booking_id` (uuid, foreign key)
  - `sla_contract_id` (uuid, foreign key, nullable)
  - `incident_type` (text) - 'flight_delay', 'accommodation_issue', 'medical', 'document_issue', 'other'
  - `severity` (text) - 'low', 'medium', 'high', 'critical'
  - `description` (text)
  - `reported_at` (timestamptz)
  - `response_time_minutes` (integer, nullable)
  - `resolved_at` (timestamptz, nullable)
  - `resolution_notes` (text)
  - `status` (text) - 'open', 'in_progress', 'resolved', 'closed'
  - `sla_met` (boolean, default: true)
  - `created_at` (timestamptz)
  
  ### `service_metrics` - Metrike kvaliteta usluga
  - `id` (uuid, primary key)
  - `metric_date` (date)
  - `supplier_id` (uuid, foreign key, nullable)
  - `destination_id` (uuid, foreign key, nullable)
  - `metric_type` (text) - 'customer_satisfaction', 'response_time', 'incident_rate', 'sla_compliance'
  - `metric_value` (decimal)
  - `target_value` (decimal)
  - `unit` (text) - 'percentage', 'minutes', 'count', 'score'
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ## Security
  
  Omogućen Row Level Security (RLS) na svim tabelama.
  Politike omogućavaju autentifikovanim korisnicima pristup podacima.
*/

-- Osnovne tabele

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  customer_type text NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate')),
  service_tier text NOT NULL DEFAULT 'standard' CHECK (service_tier IN ('standard', 'premium')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hotel', 'airline', 'transport', 'insurance')),
  contact_email text,
  contact_phone text,
  country text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  season text CHECK (season IN ('summer', 'winter', 'year_round')),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('package', 'cruise', 'business_travel', 'custom')),
  base_price decimal(10,2) NOT NULL DEFAULT 0,
  season text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Finansijsko upravljanje

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL,
  year integer NOT NULL,
  planned_revenue decimal(12,2) NOT NULL DEFAULT 0,
  planned_expenses decimal(12,2) NOT NULL DEFAULT 0,
  marketing_budget decimal(12,2) DEFAULT 0,
  operations_budget decimal(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'closed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  travel_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  cost_price decimal(10,2) NOT NULL DEFAULT 0,
  net_profit decimal(10,2) DEFAULT 0,
  number_of_travelers integer DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('accommodation', 'transport', 'marketing', 'operations', 'staff', 'other')),
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer')),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  revenue_type text NOT NULL DEFAULT 'booking' CHECK (revenue_type IN ('booking', 'service_fee', 'insurance', 'other')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cost_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name text NOT NULL,
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  allocated_amount decimal(10,2) NOT NULL,
  allocation_percentage decimal(5,2),
  period text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Upravljanje nivoom usluga (SLM)

CREATE TABLE IF NOT EXISTS service_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text UNIQUE NOT NULL,
  response_time_minutes integer NOT NULL DEFAULT 30,
  change_policy_hours integer NOT NULL DEFAULT 24,
  support_availability text NOT NULL DEFAULT 'business_hours',
  includes_insurance boolean DEFAULT false,
  includes_wifi boolean DEFAULT false,
  includes_medical_support boolean DEFAULT false,
  price_modifier decimal(5,2) DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sla_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  service_level_id uuid REFERENCES service_levels(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'violated')),
  agreed_response_time integer,
  agreed_availability text,
  digital_signature text,
  terms text,
  created_at timestamptz DEFAULT now(),
  signed_at timestamptz
);

CREATE TABLE IF NOT EXISTS service_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_title text NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  requested_by text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'evaluating', 'approved', 'rejected', 'implemented')),
  estimated_cost decimal(10,2),
  feasibility text CHECK (feasibility IN ('feasible', 'not_feasible', 'needs_review')),
  evaluation_notes text,
  created_at timestamptz DEFAULT now(),
  evaluated_at timestamptz
);

CREATE TABLE IF NOT EXISTS ola_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_number text UNIQUE NOT NULL,
  service_owner text NOT NULL,
  description text NOT NULL,
  agreed_metrics jsonb,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number text UNIQUE NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  sla_contract_id uuid REFERENCES sla_contracts(id) ON DELETE SET NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('flight_delay', 'accommodation_issue', 'medical', 'document_issue', 'other')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  reported_at timestamptz DEFAULT now(),
  response_time_minutes integer,
  resolved_at timestamptz,
  resolution_notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  sla_met boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('customer_satisfaction', 'response_time', 'incident_rate', 'sla_compliance')),
  metric_value decimal(10,2) NOT NULL,
  target_value decimal(10,2) NOT NULL,
  unit text NOT NULL CHECK (unit IN ('percentage', 'minutes', 'count', 'score')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ola_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow public access for demo purposes - u produkciji bi bilo vezano za auth.uid())

CREATE POLICY "Allow public access to customers" ON customers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to suppliers" ON suppliers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to destinations" ON destinations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to products" ON products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to budgets" ON budgets FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to bookings" ON bookings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON expenses FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to revenues" ON revenues FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to cost_allocations" ON cost_allocations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to service_levels" ON service_levels FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to sla_contracts" ON sla_contracts FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to service_requirements" ON service_requirements FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to ola_agreements" ON ola_agreements FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to service_incidents" ON service_incidents FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to service_metrics" ON service_metrics FOR ALL TO public USING (true) WITH CHECK (true);

-- Create indexes for better query performance

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_product ON bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_expenses_budget ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_revenues_budget ON revenues(budget_id);
CREATE INDEX IF NOT EXISTS idx_revenues_customer ON revenues(customer_id);
CREATE INDEX IF NOT EXISTS idx_incidents_booking ON service_incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON service_incidents(status);
CREATE INDEX IF NOT EXISTS idx_sla_contracts_customer ON sla_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON service_metrics(metric_date);