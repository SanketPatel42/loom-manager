CREATE TABLE `overhead_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `monthly_production` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`quality_id` text NOT NULL,
	`meters_produced` real NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
