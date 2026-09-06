DROP INDEX `mistris_primary_phone_idx` ON `mistris`;

ALTER TABLE `mistris`
    ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED') NOT NULL DEFAULT 'PENDING';

CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN') NOT NULL DEFAULT 'SUPER_ADMIN',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `admin_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `last_used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `admin_sessions_token_hash_key`(`token_hash`),
    INDEX `admin_sessions_admin_id_idx`(`admin_id`),
    INDEX `admin_sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `admin_audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NULL,
    `entity_id` VARCHAR(100) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `admin_audit_logs_admin_id_created_at_idx`(`admin_id`, `created_at`),
    INDEX `admin_audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `mistris_primary_phone_key` ON `mistris`(`primary_phone`);
CREATE INDEX `mistris_status_created_at_idx` ON `mistris`(`status`, `created_at`);

ALTER TABLE `admin_sessions`
    ADD CONSTRAINT `admin_sessions_admin_id_fkey`
    FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `admin_audit_logs`
    ADD CONSTRAINT `admin_audit_logs_admin_id_fkey`
    FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
