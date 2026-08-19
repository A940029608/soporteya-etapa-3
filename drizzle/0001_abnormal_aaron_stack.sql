CREATE TABLE `ticket_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`authorId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`field` varchar(80),
	`oldValue` text,
	`newValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`folio` varchar(40) NOT NULL,
	`title` varchar(140) NOT NULL,
	`category` varchar(80) NOT NULL,
	`priority` enum('Baja','Media','Alta','Urgente') NOT NULL,
	`description` text NOT NULL,
	`status` enum('Abierto','En atención','Resuelto','Cerrado') NOT NULL DEFAULT 'Abierto',
	`ownerId` int NOT NULL,
	`assigneeId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_folio_unique` UNIQUE(`folio`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `supportRole` enum('colaborador','tecnico','coordinador') DEFAULT 'colaborador' NOT NULL;--> statement-breakpoint
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_ticketId_tickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assigneeId_users_id_fk` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `comments_ticket_idx` ON `ticket_comments` (`ticketId`);--> statement-breakpoint
CREATE INDEX `history_ticket_idx` ON `ticket_history` (`ticketId`);--> statement-breakpoint
CREATE INDEX `tickets_owner_idx` ON `tickets` (`ownerId`);--> statement-breakpoint
CREATE INDEX `tickets_assignee_idx` ON `tickets` (`assigneeId`);--> statement-breakpoint
CREATE INDEX `tickets_status_idx` ON `tickets` (`status`);--> statement-breakpoint
CREATE INDEX `tickets_priority_idx` ON `tickets` (`priority`);