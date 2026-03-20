CREATE TABLE `purchase_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`date` text NOT NULL,
	`kg` real,
	`beam_no` text,
	`weight` real,
	`meters` real,
	`notes` text,
	`created_at` integer DEFAULT 1772349580187,
	`updated_at` integer DEFAULT 1772349580187
);
--> statement-breakpoint
CREATE TABLE `sale_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`date` text NOT NULL,
	`takas` real NOT NULL,
	`meters` real NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT 1772349580187,
	`updated_at` integer DEFAULT 1772349580187
);
--> statement-breakpoint
ALTER TABLE purchases ADD `type` text DEFAULT 'yarn' NOT NULL;--> statement-breakpoint
ALTER TABLE purchases ADD `number_of_beams` real;--> statement-breakpoint
ALTER TABLE purchases ADD `rate_per_beam` real;--> statement-breakpoint
ALTER TABLE purchases ADD `quality_id` text;--> statement-breakpoint
ALTER TABLE purchases ADD `tars` real;--> statement-breakpoint
ALTER TABLE purchases ADD `meters` real;--> statement-breakpoint
ALTER TABLE sales ADD `type` text DEFAULT 'spot' NOT NULL;