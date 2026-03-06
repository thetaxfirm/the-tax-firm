CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`engagementId` int,
	`fileName` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(200) NOT NULL,
	`category` enum('tax_return','w2_1099','business_docs','financial_statement','receipt','contract','other') NOT NULL DEFAULT 'other',
	`uploadedBy` enum('client','admin') NOT NULL DEFAULT 'client',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`serviceType` enum('tax_strategy','fractional_cfo','bookkeeping','roth_conversion','other') NOT NULL,
	`status` enum('active','in_progress','pending_review','completed','on_hold') NOT NULL DEFAULT 'active',
	`description` text,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`engagementId` int,
	`senderRole` enum('client','admin') NOT NULL,
	`senderName` varchar(200),
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
