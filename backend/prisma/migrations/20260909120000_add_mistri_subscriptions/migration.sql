-- CreateTable
CREATE TABLE `mistri_subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mistri_id` INTEGER NOT NULL,
    `plan` ENUM('FREE', 'PAID') NOT NULL DEFAULT 'FREE',
    `state` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `price_inr` INTEGER NOT NULL DEFAULT 0,
    `starts_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mistri_subscriptions_mistri_id_key`(`mistri_id`),
    INDEX `mistri_subscriptions_plan_state_city_category_expires_at_idx`(`plan`, `state`, `city`, `category`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill: every existing Mistri gets a FREE subscription row so later lookups
-- and admin edits always find one.
INSERT INTO `mistri_subscriptions` (`mistri_id`, `plan`, `state`, `city`, `category`, `price_inr`, `created_at`, `updated_at`)
SELECT `id`, 'FREE', `state`, `city`, `category`, 0, NOW(3), NOW(3) FROM `mistris`;
