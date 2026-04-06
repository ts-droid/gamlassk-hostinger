ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','member') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipStatus` enum('pending','active','inactive') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `membershipNumber` varchar(50);