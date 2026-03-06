CREATE TABLE `questionnaire_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`selfEmployed` boolean NOT NULL,
	`w2Employee` boolean NOT NULL,
	`annualIncome` varchar(100) NOT NULL,
	`ownsRealEstate` boolean NOT NULL,
	`rothConversionInterest` boolean NOT NULL,
	`retirementSavings` varchar(100) NOT NULL,
	`expectations` text,
	`status` enum('new','reviewed','contacted') NOT NULL DEFAULT 'new',
	`notes` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionnaire_responses_id` PRIMARY KEY(`id`)
);
