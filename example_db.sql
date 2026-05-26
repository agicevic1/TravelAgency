-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 13, 2026 at 06:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travelplus`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_number` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `booking_date` date NOT NULL,
  `travel_date` date NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cost_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_profit` decimal(10,2) DEFAULT 0.00,
  `number_of_travelers` int(11) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_number`, `customer_id`, `product_id`, `booking_date`, `travel_date`, `status`, `total_price`, `cost_price`, `net_profit`, `number_of_travelers`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'BK-2024-001', 1, 1, '2024-03-15', '2024-07-20', 'confirmed', 9500.00, 680.00, 270.00, 2, 'Premium klijent - dodatni zahtjevi za sobu sa pogledom na more', '2026-04-13 00:06:55', '2026-04-13 15:28:20'),
(2, 'BK-2024-002', 2, 2, '2024-03-10', '2024-12-15', 'confirmed', 4500.00, 320.00, 130.00, 1, 'Standardni paket', '2026-04-13 00:06:55', '2026-04-13 15:05:20'),
(3, 'BK-2024-003', 3, 4, '2024-03-20', '2024-05-10', 'confirmed', 15200.00, 1100.00, 420.00, 4, 'Korporativno putovanje - tim building', '2026-04-13 00:06:55', '2026-04-13 15:08:07'),
(4, 'BK-2024-004', 4, 3, '2024-02-28', '2024-08-05', 'pending', 2500.00, 1900.00, 600.00, 1, 'Čeka potvrdu plaćanja', '2026-04-13 00:06:55', '2026-04-13 15:29:46'),
(5, 'BK-2024-005', 5, 1, '2024-04-01', '2024-08-15', 'confirmed', 950.00, 680.00, 270.00, 2, 'Premium klijent', '2026-04-13 00:06:55', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `season` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `planned_revenue` decimal(12,2) NOT NULL DEFAULT 0.00,
  `planned_expenses` decimal(12,2) NOT NULL DEFAULT 0.00,
  `marketing_budget` decimal(12,2) DEFAULT 0.00,
  `operations_budget` decimal(12,2) DEFAULT 0.00,
  `status` enum('draft','approved','active','closed') NOT NULL DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `season`, `year`, `planned_revenue`, `planned_expenses`, `marketing_budget`, `operations_budget`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'summer_2024', 2024, 500000.00, 350000.00, 50000.00, 80000.00, 'active', 'Ljetna sezona - fokus na Jadransko more', '2026-04-13 00:06:55', '2026-04-13 00:06:55'),
(2, 'winter_2024', 2024, 280000.00, 180000.00, 35000.00, 45000.00, 'approved', 'Zimska sezona - ski destinacije', '2026-04-13 00:06:55', '2026-04-13 00:06:55'),
(3, 'year_round_2024', 2024, 450000.00, 320000.00, 40000.00, 60000.00, 'active', 'Godišnji kontinuirani poslovi', '2026-04-13 00:06:55', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `cost_allocations`
--

CREATE TABLE `cost_allocations` (
  `id` int(11) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `expense_id` int(11) NOT NULL,
  `allocated_amount` decimal(10,2) NOT NULL,
  `allocation_percentage` decimal(5,2) DEFAULT NULL,
  `period` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cost_allocations`
--

INSERT INTO `cost_allocations` (`id`, `branch_name`, `expense_id`, `allocated_amount`, `allocation_percentage`, `period`, `created_at`) VALUES
(1, 'Beograd ', 5, 4250.00, 34.00, 'Q1_2025', '2026-04-13 00:06:55'),
(2, 'Podgorica', 5, 2550.00, 20.40, 'Q1_2025', '2026-04-13 00:06:55'),
(3, 'Sarajevo', 5, 5700.00, 45.60, 'Q1_2025', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `customer_type` enum('individual','corporate') NOT NULL DEFAULT 'individual',
  `service_tier` enum('standard','premium') NOT NULL DEFAULT 'standard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `customer_type`, `service_tier`, `created_at`) VALUES
(1, 'Mujo Mujić', 'mujo.mujic@email.com', '+387-64-123-4567', 'individual', 'premium', '2026-04-13 00:06:55'),
(2, 'Ana Petrović', 'ana.petrovic@email.com', '+381-65-987-6543', 'individual', 'standard', '2026-04-13 00:06:55'),
(3, 'Tech Solutions d.o.o.', 'contact@techsolutions.rs', '+381-11-345-6789', 'corporate', 'premium', '2026-04-13 00:06:55'),
(4, 'Hana Hodžić', 'hana.hodzic@email.com', '+387-63-555-1234', 'individual', 'standard', '2026-04-13 00:06:55'),
(5, 'Milan Jovanović', 'milan.jovanovic@email.com', '+381-64-777-8888', 'individual', 'premium', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--

CREATE TABLE `destinations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `season` enum('summer','winter','year_round') DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `destinations`
--

INSERT INTO `destinations` (`id`, `name`, `country`, `season`, `description`, `is_active`, `created_at`) VALUES
(1, 'Dubrovnik', 'Hrvatska', 'summer', 'Prelepa obala Jadranskog mora', 1, '2026-04-13 00:06:55'),
(2, 'Kopaonik', 'Srbija', 'winter', 'Ski centar sa modernim stazama', 1, '2026-04-13 00:06:55'),
(3, 'Karipska krstarenja', 'Karibi', 'year_round', 'Luksuzna krstarenja toplim morima', 1, '2026-04-13 00:06:55'),
(4, 'Barcelona', 'Španija', 'year_round', 'Kulturna prestonica sa Gaudi arhitekturom', 1, '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `category` enum('accommodation','transport','marketing','operations','staff','other') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `budget_id`, `supplier_id`, `category`, `description`, `amount`, `expense_date`, `payment_status`, `created_at`) VALUES
(1, 1, 1, 'accommodation', 'Zakup 20 soba za jul 2024', 4500.00, '2024-03-01', 'paid', '2026-04-13 00:06:55'),
(2, 1, 3, 'transport', 'Avionske karte - grupna rezervacija', 2800.00, '2024-03-05', 'paid', '2026-04-13 00:06:55'),
(3, 1, NULL, 'marketing', 'Facebook i Instagram oglašavanje', 1200.00, '2024-03-10', 'paid', '2026-04-13 00:06:55'),
(4, 2, 2, 'accommodation', 'Zakup smještajnih kapaciteta', 3200.00, '2024-04-01', 'pending', '2026-04-13 00:06:55'),
(5, 3, NULL, 'operations', 'IT sistem i podrška', 8500.00, '2024-01-15', 'paid', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `ola_agreements`
--

CREATE TABLE `ola_agreements` (
  `id` int(11) NOT NULL,
  `agreement_number` varchar(50) NOT NULL,
  `service_owner` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `agreed_metrics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`agreed_metrics`)),
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','expired') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `type` enum('package','cruise','business_travel','custom') NOT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `season` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `destination_id`, `type`, `base_price`, `season`, `description`, `is_active`, `created_at`) VALUES
(1, 'Ljetovanje Dubrovnik - 7 dana', 1, 'package', 850.00, 'summer', 'All-inclusive paket sa smještajem i doručkom', 1, '2026-04-13 00:06:55'),
(2, 'Zimovanje Kopaonik - 5 dana', 2, 'package', 450.00, 'winter', 'Ski-pass i smještaj', 1, '2026-04-13 00:06:55'),
(3, 'Karipsko krstarenje - 10 dana', 3, 'cruise', 2500.00, 'year_round', 'Luksuzno krstarenje sa 5 destinacija', 1, '2026-04-13 00:06:55'),
(4, 'Vikend u Barceloni', 4, 'package', 380.00, 'year_round', 'Gradski odmor sa obilascima', 1, '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `revenues`
--

CREATE TABLE `revenues` (
  `id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer') NOT NULL,
  `payment_date` date NOT NULL,
  `revenue_type` enum('booking','service_fee','insurance','other') NOT NULL DEFAULT 'booking',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `revenues`
--

INSERT INTO `revenues` (`id`, `budget_id`, `booking_id`, `customer_id`, `amount`, `payment_method`, `payment_date`, `revenue_type`, `created_at`) VALUES
(1, 1, 1, 1, 9500.00, 'card', '2024-03-15', 'booking', '2026-04-13 00:06:55'),
(2, 2, 2, 2, 4500.00, 'bank_transfer', '2024-03-12', 'booking', '2026-04-13 00:06:55'),
(3, 3, 3, 3, 15200.00, 'bank_transfer', '2024-03-25', 'booking', '2026-04-13 00:06:55'),
(4, 1, 5, 5, 950.00, 'card', '2024-04-01', 'booking', '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `service_incidents`
--

CREATE TABLE `service_incidents` (
  `id` int(11) NOT NULL,
  `incident_number` varchar(50) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `sla_contract_id` int(11) DEFAULT NULL,
  `incident_type` enum('flight_delay','accommodation_issue','medical','document_issue','other') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `description` text NOT NULL,
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `response_time_minutes` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `sla_met` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_incidents`
--

INSERT INTO `service_incidents` (`id`, `incident_number`, `booking_id`, `sla_contract_id`, `incident_type`, `severity`, `description`, `reported_at`, `response_time_minutes`, `resolved_at`, `resolution_notes`, `status`, `sla_met`, `created_at`) VALUES
(1, 'INC-2024-001', 1, 1, 'accommodation_issue', 'medium', 'Problem sa klimom u hotelskoj sobi', '2024-07-21 12:30:00', 25, '2024-07-21 14:00:00', 'Promijenjena soba, klijent zadovoljan', 'closed', 1, '2026-04-13 00:06:55'),
(2, 'INC-2024-002', 2, 2, 'flight_delay', 'high', 'Let kasni 3 sata zbog vremenskih uslova', '2024-12-15 07:00:00', 45, '2024-12-15 08:30:00', 'Obezbijeđen besplatan transfer i obrok', 'closed', 1, '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `service_levels`
--

CREATE TABLE `service_levels` (
  `id` int(11) NOT NULL,
  `tier_name` varchar(50) NOT NULL,
  `response_time_minutes` int(11) NOT NULL DEFAULT 30,
  `change_policy_hours` int(11) NOT NULL DEFAULT 24,
  `support_availability` varchar(100) NOT NULL DEFAULT 'business_hours',
  `includes_insurance` tinyint(1) DEFAULT 0,
  `includes_wifi` tinyint(1) DEFAULT 0,
  `includes_medical_support` tinyint(1) DEFAULT 0,
  `price_modifier` decimal(5,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_levels`
--

INSERT INTO `service_levels` (`id`, `tier_name`, `response_time_minutes`, `change_policy_hours`, `support_availability`, `includes_insurance`, `includes_wifi`, `includes_medical_support`, `price_modifier`, `description`, `is_active`, `created_at`) VALUES
(1, 'standard', 120, 24, 'business_hours', 0, 0, 0, 0.00, 'Standardni nivo usluge - osnovna podrška', 1, '2026-04-13 00:06:55'),
(2, 'premium', 30, 48, '24/7', 1, 1, 1, 15.00, 'Premium nivo - 24/7 podrška, osiguranje, WiFi, medicinska pomoć', 1, '2026-04-13 00:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `service_metrics`
--

CREATE TABLE `service_metrics` (
  `id` int(11) NOT NULL,
  `metric_date` date NOT NULL DEFAULT curdate(),
  `supplier_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `metric_type` enum('customer_satisfaction','response_time','incident_rate','sla_compliance','system_availability','mean_time_to_resolution','first_response_time','voucher_delivery_time') NOT NULL,
  `metric_value` decimal(10,2) NOT NULL,
  `target_value` decimal(10,2) NOT NULL,
  `unit` enum('percentage','minutes','count','score','hours') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_metrics`
--

INSERT INTO `service_metrics` (`id`, `metric_date`, `supplier_id`, `destination_id`, `metric_type`, `metric_value`, `target_value`, `unit`, `notes`, `created_at`) VALUES
(1, '2024-03-01', 1, 1, 'customer_satisfaction', 92.00, 85.00, 'percentage', 'Visoko zadovoljstvo gostiju', '2026-04-13 00:06:55'),
(2, '2024-03-01', NULL, NULL, 'response_time', 28.00, 30.00, 'minutes', 'Prosječno vrijeme odziva Premium klijenata', '2026-04-13 00:06:55'),
(3, '2024-03-01', 2, 2, 'incident_rate', 2.00, 5.00, 'count', 'Broj incidenata u martu', '2026-04-13 00:06:55'),
(4, '2024-03-15', NULL, NULL, 'sla_compliance', 98.50, 95.00, 'percentage', 'Procenat ispunjenih SLA ugovora', '2026-04-13 00:06:55'),
(5, '2025-04-10', NULL, NULL, 'system_availability', 99.95, 99.90, 'percentage', 'Dostupnost stranice', '2025-04-09 22:00:00'),
(6, '2025-02-12', NULL, NULL, 'mean_time_to_resolution', 4.20, 4.00, 'hours', 'Vrijeme rješavanja tehničkih problema', '2025-02-11 23:00:00'),
(7, '2024-06-11', NULL, NULL, 'first_response_time', 12.00, 30.00, 'minutes', 'Brzina odgovora na upit klijenta', '2024-06-10 22:00:00'),
(8, '2025-01-06', NULL, 1, 'voucher_delivery_time', 7.50, 10.00, 'minutes', 'Vrijeme isporuke dokumenata nakon uplate', '2025-01-05 23:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `service_requirements`
--

CREATE TABLE `service_requirements` (
  `id` int(11) NOT NULL,
  `requirement_title` varchar(255) NOT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `requested_by` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `status` enum('submitted','evaluating','approved','rejected','implemented') NOT NULL DEFAULT 'submitted',
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `feasibility` enum('feasible','not_feasible','needs_review') DEFAULT NULL,
  `evaluation_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `evaluated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_requirements`
--

INSERT INTO `service_requirements` (`id`, `requirement_title`, `destination_id`, `requested_by`, `description`, `priority`, `status`, `estimated_cost`, `feasibility`, `evaluation_notes`, `created_at`, `evaluated_at`) VALUES
(1, 'WiFi na krstarenju', 3, 'mujo.mujic@email.com', 'Zahtjev za stabilnim WiFi internetom tokom cijelog krstarenja', 'high', 'evaluating', 150.00, 'feasible', 'Moguće uključiti Starlink paket', '2026-04-13 00:06:55', NULL),
(2, 'Medicinska podrška na skijalištu', 2, 'ana.petrovic@email.com', 'Prisutnost ljekara na skijalištu 24/7', 'critical', 'approved', 500.00, 'feasible', 'Ugovor sa lokalnom bolnicom', '2026-04-13 00:06:55', NULL),
(3, 'Vegan opcije u hotelima', 1, 'hana.hodzic@email.com', 'Veći izbor veganske hrane u hotelskom restoranu', 'medium', 'implemented', 0.00, 'feasible', 'Hotel implementirao vegan meni', '2026-04-13 00:06:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sla_contracts`
--

CREATE TABLE `sla_contracts` (
  `id` int(11) NOT NULL,
  `contract_number` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `service_level_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','completed','violated') NOT NULL DEFAULT 'draft',
  `agreed_response_time` int(11) DEFAULT NULL,
  `agreed_availability` varchar(100) DEFAULT NULL,
  `digital_signature` varchar(255) DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `signed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sla_contracts`
--

INSERT INTO `sla_contracts` (`id`, `contract_number`, `customer_id`, `booking_id`, `service_level_id`, `start_date`, `end_date`, `status`, `agreed_response_time`, `agreed_availability`, `digital_signature`, `terms`, `created_at`, `signed_at`) VALUES
(1, 'SLA-2024-001', 1, 1, 2, '2024-07-20', '2024-07-27', 'active', 30, '24/7', 'HASH_ABC123XYZ', 'Premium usluge - 24/7 podrška, besplatna promena termina do 48h', '2026-04-13 00:06:55', '2024-03-14 23:00:00'),
(2, 'SLA-2024-002', 2, 2, 1, '2024-12-15', '2024-12-20', 'active', 120, 'business_hours', 'HASH_DEF456UVW', 'Standardne usluge - radnim danom 09-17h', '2026-04-13 00:06:55', '2024-03-09 23:00:00'),
(3, 'SLA-2024-003', 5, 5, 2, '2024-08-15', '2024-08-22', 'active', 30, '24/7', 'HASH_GHI789RST', 'Premium usluge - kompletna podrška', '2026-04-13 00:06:55', '2024-03-31 22:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('hotel','airline','transport','insurance') NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `type`, `contact_email`, `contact_phone`, `country`, `created_at`) VALUES
(1, 'Hotel Excelsior', 'hotel', 'info@excelsior.hr', '+385-20-353-353', 'Hrvatska', '2026-04-13 00:06:55'),
(2, 'Grand Hotel Kopaonik', 'hotel', 'reception@grandkopaonik.rs', '+381-36-471-000', 'Srbija', '2026-04-13 00:06:55'),
(3, 'Air Serbia', 'airline', 'info@airserbia.com', '+381-11-311-2123', 'Srbija', '2026-04-13 00:06:55'),
(4, 'Croatia Airlines', 'airline', 'info@croatiaairlines.hr', '+385-1-6676-555', 'Hrvatska', '2026-04-13 00:06:55'),
(5, 'Royal Caribbean', 'transport', 'info@royalcaribbean.com', '+1-800-256-6649', 'SAD', '2026-04-13 00:06:55'),
(6, 'Travel Insurance Plus', 'insurance', 'claims@travelinsurance.com', '+381-11-222-333', 'Srbija', '2026-04-13 00:06:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_number` (`booking_number`),
  ADD KEY `idx_bookings_customer` (`customer_id`),
  ADD KEY `idx_bookings_product` (`product_id`),
  ADD KEY `idx_bookings_date` (`booking_date`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cost_allocations`
--
ALTER TABLE `cost_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_id` (`expense_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `idx_expenses_budget` (`budget_id`);

--
-- Indexes for table `ola_agreements`
--
ALTER TABLE `ola_agreements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agreement_number` (`agreement_number`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indexes for table `revenues`
--
ALTER TABLE `revenues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_revenues_budget` (`budget_id`),
  ADD KEY `idx_revenues_customer` (`customer_id`);

--
-- Indexes for table `service_incidents`
--
ALTER TABLE `service_incidents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `incident_number` (`incident_number`),
  ADD KEY `sla_contract_id` (`sla_contract_id`),
  ADD KEY `idx_incidents_booking` (`booking_id`),
  ADD KEY `idx_incidents_status` (`status`);

--
-- Indexes for table `service_levels`
--
ALTER TABLE `service_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tier_name` (`tier_name`);

--
-- Indexes for table `service_metrics`
--
ALTER TABLE `service_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `destination_id` (`destination_id`),
  ADD KEY `idx_metrics_date` (`metric_date`);

--
-- Indexes for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indexes for table `sla_contracts`
--
ALTER TABLE `sla_contracts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contract_number` (`contract_number`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `service_level_id` (`service_level_id`),
  ADD KEY `idx_sla_contracts_customer` (`customer_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cost_allocations`
--
ALTER TABLE `cost_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ola_agreements`
--
ALTER TABLE `ola_agreements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `revenues`
--
ALTER TABLE `revenues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `service_incidents`
--
ALTER TABLE `service_incidents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_levels`
--
ALTER TABLE `service_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_metrics`
--
ALTER TABLE `service_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `service_requirements`
--
ALTER TABLE `service_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sla_contracts`
--
ALTER TABLE `sla_contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cost_allocations`
--
ALTER TABLE `cost_allocations`
  ADD CONSTRAINT `cost_allocations_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `revenues`
--
ALTER TABLE `revenues`
  ADD CONSTRAINT `revenues_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `revenues_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `revenues_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_incidents`
--
ALTER TABLE `service_incidents`
  ADD CONSTRAINT `service_incidents_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_incidents_ibfk_2` FOREIGN KEY (`sla_contract_id`) REFERENCES `sla_contracts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `service_metrics`
--
ALTER TABLE `service_metrics`
  ADD CONSTRAINT `service_metrics_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `service_metrics_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD CONSTRAINT `service_requirements_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sla_contracts`
--
ALTER TABLE `sla_contracts`
  ADD CONSTRAINT `sla_contracts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sla_contracts_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sla_contracts_ibfk_3` FOREIGN KEY (`service_level_id`) REFERENCES `service_levels` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
