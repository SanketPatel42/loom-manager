CREATE TABLE `beam_pasar` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`beam_no` text NOT NULL,
	`count` integer,
	`tars` integer NOT NULL,
	`no_of_taka` integer,
	`rate_per_beam` real NOT NULL,
	`quality_id` text,
	`created_at` integer DEFAULT 1771000666364,
	`updated_at` integer DEFAULT 1771000666364
);
--> statement-breakpoint
CREATE TABLE `beams` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`warper` text NOT NULL,
	`beam_no` text NOT NULL,
	`no_of_takas` real NOT NULL,
	`no_of_tar` real NOT NULL,
	`price_per_beam` real NOT NULL,
	`total` real NOT NULL,
	`quality_id` text,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `begari_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`monthly_salary` real NOT NULL,
	`join_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bobbin_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_id` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`cycle` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bobbin_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`full_day_salary` real NOT NULL,
	`join_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fabric_calculations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`warp_weight` real,
	`weft_weight` real,
	`total_weight` real
);
--> statement-breakpoint
CREATE TABLE `firms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`gst_number` text NOT NULL,
	`address` text NOT NULL,
	`contact_person` text NOT NULL,
	`phone_number` text NOT NULL,
	`email` text NOT NULL,
	`documents` text DEFAULT '[]',
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `gsm_calculations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`fabric_width` real NOT NULL,
	`data` text NOT NULL,
	`gsm` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `master_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`monthly_salary` real NOT NULL,
	`join_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_reminder` integer DEFAULT false,
	`reminder_date` text,
	`completed` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`supplier` text NOT NULL,
	`yarn_type` text NOT NULL,
	`danier` text NOT NULL,
	`tons` real NOT NULL,
	`rate_per_ton` real NOT NULL,
	`total` real NOT NULL,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `qualities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate_per_meter` real NOT NULL,
	`description` text,
	`epi` real,
	`ppi` real,
	`danier` text,
	`tars` real,
	`beam_rate` real,
	`beam_pasar_rate` real,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `quality_calculations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`gsm` real NOT NULL,
	`fabric_width` real NOT NULL,
	`quality_grams` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`party` text NOT NULL,
	`takas` real NOT NULL,
	`meters` real NOT NULL,
	`rate_per_meter` real NOT NULL,
	`amount` real NOT NULL,
	`tax` real NOT NULL,
	`total` real NOT NULL,
	`payment_terms` integer NOT NULL,
	`expected_payment_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`quality_id` text,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `stock` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`yarn_count` text NOT NULL,
	`boxes_available` integer NOT NULL,
	`created_at` integer DEFAULT 1771000666364,
	`updated_at` integer DEFAULT 1771000666364
);
--> statement-breakpoint
CREATE TABLE `takas` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`available` real NOT NULL,
	`folded` real NOT NULL,
	`remaining` real NOT NULL,
	`quality_id` text,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `tfo_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_id` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`cycle` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tfo_productions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`spindle_rpm` real NOT NULL,
	`working_time_hours` real NOT NULL,
	`denier` real NOT NULL,
	`total_spindles` integer NOT NULL,
	`tpm` real NOT NULL,
	`production_kg` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tfo_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`full_day_salary` real NOT NULL,
	`join_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`firm` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`purpose` text NOT NULL,
	`payee` text NOT NULL,
	`created_at` integer DEFAULT 1771000666364,
	`updated_at` integer DEFAULT 1771000666364
);
--> statement-breakpoint
CREATE TABLE `warping_productions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`head_rpm` real NOT NULL,
	`time_minutes` real NOT NULL,
	`picks_per_dm` real NOT NULL,
	`efficiency` real NOT NULL,
	`production_meters` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wireman_bills` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_id` text NOT NULL,
	`date` text NOT NULL,
	`bill_amount` real NOT NULL,
	`description` text NOT NULL,
	`cycle` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wireman_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`join_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `worker_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`emergency_contact` text NOT NULL,
	`created_at` integer DEFAULT 1771000666363,
	`updated_at` integer DEFAULT 1771000666363
);
--> statement-breakpoint
CREATE TABLE `worker_sheet_data` (
	`id` text PRIMARY KEY DEFAULT 'main' NOT NULL,
	`assignments` text NOT NULL,
	`grid_data` text NOT NULL,
	`last_updated` text DEFAULT '2026-02-13T16:37:46.364Z',
	`created_at` integer DEFAULT 1771000666364,
	`updated_at` integer DEFAULT 1771000666364
);
--> statement-breakpoint
CREATE TABLE `yarn_consumptions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`fabric_length` real NOT NULL,
	`data` text NOT NULL,
	`warp_weight_kg` real,
	`weft_weight_kg` real,
	`total_weight_kg` real
);
--> statement-breakpoint
CREATE TABLE `yarn_conversions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`result` real NOT NULL,
	`result_unit` text NOT NULL
);
