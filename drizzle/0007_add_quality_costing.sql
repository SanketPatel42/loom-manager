CREATE TABLE `quality_costing` (
	`id` text PRIMARY KEY NOT NULL,
	`quality_id` text NOT NULL,
	`warp_rate` real NOT NULL DEFAULT 0,
	`weft_rate` real NOT NULL DEFAULT 0,
	`extra_costs` text DEFAULT '[]',
	`created_at` integer,
	`updated_at` integer
);
