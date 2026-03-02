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
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Drop not null from column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE purchases ADD `type` text DEFAULT 'yarn' NOT NULL;--> statement-breakpoint
ALTER TABLE purchases ADD `number_of_beams` real;--> statement-breakpoint
ALTER TABLE purchases ADD `rate_per_beam` real;--> statement-breakpoint
ALTER TABLE purchases ADD `quality_id` text;--> statement-breakpoint
ALTER TABLE purchases ADD `tars` real;--> statement-breakpoint
ALTER TABLE purchases ADD `meters` real;--> statement-breakpoint
ALTER TABLE sales ADD `type` text DEFAULT 'spot' NOT NULL;