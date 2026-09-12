-- CreateTable
CREATE TABLE `ad_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_name` VARCHAR(160) NOT NULL,
    `contact_number` VARCHAR(20) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `ad_type` VARCHAR(20) NOT NULL,
    `duration` VARCHAR(40) NOT NULL,
    `target_url` VARCHAR(500) NULL,
    `creative_url` VARCHAR(500) NULL,
    `creative_public_id` VARCHAR(255) NULL,
    `message` TEXT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ad_requests_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
