CREATE TABLE `monthly_salary_records` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`cycle` text NOT NULL,
	`production_worker_total` real DEFAULT 0 NOT NULL,
	`begari_total` real DEFAULT 0 NOT NULL,
	`tfo_total` real DEFAULT 0 NOT NULL,
	`bobbin_total` real DEFAULT 0 NOT NULL,
	`master_total` real DEFAULT 0 NOT NULL,
	`wireman_total` real DEFAULT 0 NOT NULL,
	`warping_total` real DEFAULT 0 NOT NULL,
	`beam_pasar_total` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`total_workers` integer DEFAULT 0 NOT NULL,
	`submitted_at` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
