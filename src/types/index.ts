export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customer_type: 'individual' | 'corporate';
  service_tier: 'standard' | 'premium';
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: 'hotel' | 'airline' | 'transport' | 'insurance';
  contact_email?: string;
  contact_phone?: string;
  country?: string;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  season?: 'summer' | 'winter' | 'year_round';
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  destination_id: string;
  type: 'package' | 'cruise' | 'business_travel' | 'custom';
  base_price: number;
  season?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  season: string;
  year: number;
  planned_revenue: number;
  planned_expenses: number;
  marketing_budget: number;
  operations_budget: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  product_id: string;
  booking_date: string;
  travel_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  cost_price: number;
  net_profit: number;
  number_of_travelers: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  budget_id: string;
  supplier_id?: string;
  category: 'accommodation' | 'transport' | 'marketing' | 'operations' | 'staff' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  payment_status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface Revenue {
  id: string;
  budget_id: string;
  booking_id?: string;
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  payment_date: string;
  revenue_type: 'booking' | 'service_fee' | 'insurance' | 'other';
  created_at: string;
}

export interface CostAllocation {
  id: string;
  branch_name: string;
  expense_id: string;
  allocated_amount: number;
  allocation_percentage?: number;
  period: string;
  created_at: string;
}

export interface ServiceLevel {
  id: string;
  tier_name: string;
  response_time_minutes: number;
  change_policy_hours: number;
  support_availability: string;
  includes_insurance: boolean;
  includes_wifi: boolean;
  includes_medical_support: boolean;
  price_modifier: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface SLAContract {
  id: string;
  contract_number: string;
  customer_id: string;
  booking_id?: string;
  service_level_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'violated';
  agreed_response_time?: number;
  agreed_availability?: string;
  digital_signature?: string;
  terms?: string;
  created_at: string;
  signed_at?: string;
}

export interface ServiceRequirement {
  id: string;
  requirement_title: string;
  destination_id?: string;
  requested_by: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'evaluating' | 'approved' | 'rejected' | 'implemented';
  estimated_cost?: number;
  feasibility?: 'feasible' | 'not_feasible' | 'needs_review';
  evaluation_notes?: string;
  created_at: string;
  evaluated_at?: string;
}

export interface ServiceIncident {
  id: string;
  incident_number: string;
  booking_id: string;
  sla_contract_id?: string;
  incident_type: 'flight_delay' | 'accommodation_issue' | 'medical' | 'document_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reported_at: string;
  response_time_minutes?: number;
  resolved_at?: string;
  resolution_notes?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  sla_met: boolean;
  created_at: string;
}

export interface ServiceMetric {
  id: string;
  metric_date: string;
  supplier_id?: string;
  destination_id?: string;
  metric_type: 'customer_satisfaction' | 'response_time' | 'incident_rate' | 'sla_compliance';
  metric_value: number;
  target_value: number;
  unit: 'percentage' | 'minutes' | 'count' | 'score';
  notes?: string;
  created_at: string;
}
