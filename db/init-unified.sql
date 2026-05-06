SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE `yody_fashion`;

CREATE TABLE `sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `ward` varchar(100) NOT NULL,
  `address_detail` text NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_default` (`user_id`,`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `terms_policies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('terms','privacy','other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `version` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `terms_policies` (`type`, `title`, `content`, `version`, `active`) VALUES
('terms', 'Điều khoản sử dụng', 'Chào mừng bạn đến với Yody Fashion!', '1.0', 1),
('privacy', 'Chính sách bảo mật', 'Chúng tôi cam kết bảo vệ thông tin cá nhân.', '1.0', 1);

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `address_detail` text,
  `role` enum('USER','ADMIN') DEFAULT 'USER',
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `is_verified`) VALUES
('tenho051512@gmail.com', '$2b$10$Iu1VyizZKC/dT3Q2ugYC7eKOZafgpDhs1sobMBOueIOiHENBHxyla', 'Admin', 'ADMIN', 1),
('huyhoang@gmail.com', '$2b$10$Iu1VyizZKC/dT3Q2ugYC7eKOZafgpDhs1sobMBOueIOiHENBHxyla', 'Huy Hoàng Trần', 'ADMIN', 1),
('nguyenthi@gmail.com', '$2b$10$Iu1VyizZKC/dT3Q2ugYC7eKOZafgpDhs1sobMBOueIOiHENBHxyla', 'Nguyễn Thị Hoa', 'USER', 1),
('tranvan@gmail.com', '$2b$10$Iu1VyizZKC/dT3Q2ugYC7eKOZafgpDhs1sobMBOueIOiHENBHxyla', 'Trần Văn Minh', 'USER', 1);

CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `description` text,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `description`, `display_order`) VALUES
(1, 'Nam', 'Sản phẩm thời trang dành cho nam', 1),
(2, 'Nữ', 'Sản phẩm thời trang dành cho nữ', 2),
(3, 'Trẻ em', 'Sản phẩm thời trang dành cho trẻ em', 3),
(4, 'Phụ kiện', 'Túi, mũ, khăn và phụ kiện đi kèm', 4);

CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image_url` varchar(512) NOT NULL,
  `link_url` varchar(512) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `description` text,
  `price_cents` int NOT NULL,
  `discount_percent` int DEFAULT '0',
  `specs` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `sku`, `name`, `category_id`, `description`, `price_cents`, `discount_percent`, `image_url`) VALUES
(1, 'YDY-M-POLO-001', 'Áo Polo Nam Slim', 1, 'Áo Polo Nam slim in thân trước', 499000, 10, 'https://buggy.yodycdn.com/images/product/cd39cf0670e51c752e6896c97b394308.webp'),
(2, 'YDY-W-DRESS-001', 'Áo Polo Nữ Phối Dây', 2, 'Áo Polo Nữ Phối Dây Dệt', 329000, 15, 'https://buggy.yodycdn.com/images/product/2c304767a76d367d0782955c733fe562.webp'),
(3, 'YDY-KID-TSHIRT-001', 'Áo Polo Teen', 3, 'Áo polo trẻ em', 169000, 0, 'https://buggy.yodycdn.com/images/product/9ec366d2e107e12e8bd1ce3d3ff11699.webp'),
(4, 'YDY-ACC-BAG-001', 'Túi Xách Nữ', 4, 'Túi xách nữ đeo vai', 499000, 5, 'https://buggy.yodycdn.com/images/product/32521da33ed41f1b8d186561e401e0a7.webp'),
(5, 'YDY-W-DRESS-002', 'Áo Polo In Tràn Hoạ Tiết', 2, 'Áo Polo In Tràn Hoạ Tiết - Hoạ Tiết Be 004 - XS', 329000, 0, 'https://buggy.yodycdn.com/images/product/2399417bc7a93b1eaf87949424c3c286.webp'),
(6, 'YDY-W-DRESS-003', 'Áo Polo Nữ Slim In Thân Trước Có Xẻ Tà', 2, 'Áo Polo Nữ Slim In Thân Trước Có Xẻ Tà', 399000, 10, 'https://buggy.yodycdn.com/images/product/5fb438fd96c077b8baeeba8d5c476b91.webp'),
(7, 'YDY-ACC-TL-001', 'Thắt Lưng Da Nam Khóa Tự Động TL03', 4, 'Thắt lưng da nam khóa tự động TL03', 499000, 10, 'https://buggy.yodycdn.com/images/product/d4f1749f4db5a683bd96dabd9674ee1c.webp'),
(8, 'YDY-M-TSHIRT-001', 'Áo Phông Nam Regular In BUILT FROM AMBITION', 1, 'Áo Phông Nam Regular In BUILT FROM AMBITION', 249000, 5, 'https://buggy.yodycdn.com/images/product/b5269b7431bae0aad582d9884cede3eb.webp'),
(9, 'YDY-KID-TSHIRT-002', 'Áo Phông Kid Tay Layer Phối Màu', 3, 'Áo Phông Kid Tay Layer Phối Màu', 369000, 5, 'https://buggy.yodycdn.com/images/product/e814e44e0b08d18004ceac00d283e96c.webp'),
(10, 'YDY-KID-TSHIRT-003', 'Áo Phông Kid In The Sun', 3, 'Áo Phông Kid In The Sun', 229000, 0, 'https://buggy.yodycdn.com/images/product/e967f8984ebc87eab576eb24c2eafc93.webp'),
(11, 'YDY-W-DRESS-004', 'Áo Khoác Bomber Relax Fit', 2, 'Áo Khoác Bomber Relax Fit', 899000, 30, 'https://buggy.yodycdn.com/images/product/be34c571f1b2e458ac8c6ed1a6b5a8da.webp'),
(12, 'YDY-M-POLO-002', 'Áo Polo Thể Thao Nam Waffle Phối Nẹp', 1, 'Áo Polo Thể Thao Nam Waffle Phối Nẹp', 349000, 0, 'https://buggy.yodycdn.com/images/product/47332e4da08dbf42ab5d6b497a1cbe0e.webp');


CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `url` varchar(512) NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_images` (`product_id`, `url`, `sort_order`) VALUES
(1, 'https://buggy.yodycdn.com/images/product/cd39cf0670e51c752e6896c97b394308.webp', 1),
(1, 'https://buggy.yodycdn.com/images/product/faf42eef2d86715b0af21a0acd23e59f.webp', 2),
(1, 'https://buggy.yodycdn.com/images/product/7ae6039a5b1c71fce4a75241b8eecd6e.webp', 3),
(1, 'https://buggy.yodycdn.com/images/product/65e9517656b92b41d8be52961e755c32.webp', 4),
(2, 'https://buggy.yodycdn.com/images/product/2c304767a76d367d0782955c733fe562.webp', 1),
(2, 'https://buggy.yodycdn.com/images/product/ced97f4e61dab8ba40ec6dba49c9dcbc.webp', 2),
(2, 'https://buggy.yodycdn.com/images/product/7b40355a714de2b526a45602874be9c3.webp', 3),
(3, 'https://buggy.yodycdn.com/images/product/9ec366d2e107e12e8bd1ce3d3ff11699.webp', 1),
(3, 'https://buggy.yodycdn.com/images/product/cd2a67df922871ee9799653c520a14f1.webp', 2),
(3, 'https://buggy.yodycdn.com/images/product/ffcb3a00fa3e5a078bab1c4b3a777c29.webp', 3),
(3, 'https://buggy.yodycdn.com/images/product/160f216191a44da29ddc54e264d34842.webp', 4),
(4, 'https://buggy.yodycdn.com/images/product/32521da33ed41f1b8d186561e401e0a7.webp', 1),
(4, 'https://buggy.yodycdn.com/images/product/5824d4c6d91ec88f9946d6017682c3e7.webp', 2),
(4, 'https://buggy.yodycdn.com/images/product/5ea518058d6fc5d9ec92259cbd74541a.webp', 3),
(4, 'https://buggy.yodycdn.com/images/product/d3100edbbd02d404f0ef6315c7077ce3.webp', 4),
(4, 'https://buggy.yodycdn.com/images/product/637dffa6e36ad12bc39f8b5cf5a84f4b.webp', 5),
(5, 'https://buggy.yodycdn.com/images/product/2399417bc7a93b1eaf87949424c3c286.webp', 1),
(5, 'https://buggy.yodycdn.com/images/product/486ba0478497abc4e80ef62ce81ab9eb.webp', 2),
(5, 'https://buggy.yodycdn.com/images/product/1b5b6feba51767b92dce6f22e71563c0.webp', 3),
(6, 'https://buggy.yodycdn.com/images/product/5fb438fd96c077b8baeeba8d5c476b91.webp', 1),
(6, 'https://buggy.yodycdn.com/images/product/e5dd80aba3b179f74aa927383518f372.webp', 2),
(6, 'https://buggy.yodycdn.com/images/product/71a004e4cd8f0f5688ef99b4bd662a30.webp', 3),
(6, 'https://buggy.yodycdn.com/images/product/55585fde2cebf35ef1d0807469786592.webp', 4),
(7, 'https://buggy.yodycdn.com/images/product/d4f1749f4db5a683bd96dabd9674ee1c.webp', 1),
(7, 'https://buggy.yodycdn.com/images/product/fa43e6494104616724052e15c27c837e.webp', 2),
(7, 'https://buggy.yodycdn.com/images/product/53885d11bbbbf96a54972afdb6ea8936.webp', 3),
(7, 'https://buggy.yodycdn.com/images/product/44b79d4c90b165de131edf26bb23a187.webp', 4),
(8, 'https://buggy.yodycdn.com/images/product/b5269b7431bae0aad582d9884cede3eb.webp', 1),
(8, 'https://buggy.yodycdn.com/images/product/21af7d6b3b70a97cc20504fe93020bf5.webp', 2),
(8, 'https://buggy.yodycdn.com/images/product/9e8ac3707970049999ba1f9d0a28348b.webp', 3),
(8, 'https://buggy.yodycdn.com/images/product/7ef9f7552619a660e3b615e591b38ca1.webp', 4),
(9, 'https://buggy.yodycdn.com/images/product/e814e44e0b08d18004ceac00d283e96c.webp', 1),
(9, 'https://buggy.yodycdn.com/images/product/e814e44e0b08d18004ceac00d283e96c.webp', 2),
(9, 'https://buggy.yodycdn.com/images/product/a421b93f63884dc882f2a16490ffa61f.webp', 3),
(9, 'https://buggy.yodycdn.com/images/product/26acdb1a4a251243408a983efd4277da.webp', 4),
(9, 'https://buggy.yodycdn.com/images/product/e4471b21d6072ea3dc71bbae5cd8b54d.webp', 5),
(9, 'https://buggy.yodycdn.com/images/product/187a11cdc6567527cc9e0182b3cb33df.webp', 6),
(10, 'https://buggy.yodycdn.com/images/product/e967f8984ebc87eab576eb24c2eafc93.webp', 1),
(10, 'https://buggy.yodycdn.com/images/product/8f40f70a26d9075705a5c2301327b1c0.webp', 2),
(10, 'https://buggy.yodycdn.com/images/product/d8d34b3c28899804bff16e7fa0012484.webp', 3),
(10, 'https://buggy.yodycdn.com/images/product/e58af03717ce6a7b4701fd19f274705d.webp', 4),
(10, 'https://buggy.yodycdn.com/images/product/aeeddc8f67af3001bc2a303af5b8ba29.webp', 5),
(11, 'https://buggy.yodycdn.com/images/product/be34c571f1b2e458ac8c6ed1a6b5a8da.webp', 1),
(11, 'https://buggy.yodycdn.com/images/product/06f8d639150ea8a786236ab64972435a.webp', 2),
(11, 'https://buggy.yodycdn.com/images/product/d01d9396df9340fea99413f2cf571c8a.webp', 3),
(11, 'https://buggy.yodycdn.com/images/product/fa429142030a02ad66cce725077397b7.webp', 4),
(11, 'https://buggy.yodycdn.com/images/product/407057f21a60d7de310e57c699127067.webp', 5),
(11, 'https://buggy.yodycdn.com/images/product/2bd24f01db96525318d0295da4c1552f.webp', 6),
(12, 'https://buggy.yodycdn.com/images/product/47332e4da08dbf42ab5d6b497a1cbe0e.webp', 1),
(12, 'https://buggy.yodycdn.com/images/product/0ef2519892bef55a8b69b6caeab824f4.webp', 2),
(12, 'https://buggy.yodycdn.com/images/product/62483f3eee5488354ed151c60db58d2b.webp', 3),
(12, 'https://buggy.yodycdn.com/images/product/6445dc3bed893db78d6e957abd6a51aa.webp', 4);

CREATE TABLE `inventory` (
  `product_id` bigint NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventory` (`product_id`, `stock`) VALUES (1, 100), (2, 80), (3, 150), (4, 50), (5, 120), (6, 90), (7, 110), (8, 70), (9, 60), (10, 85), (11, 40), (12, 10);

CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_product` (`session_id`, `product_id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `total_cents` int NOT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  `payment_method` varchar(50) DEFAULT 'COD',
  `payment_status` enum('PENDING','PAID','FAILED') DEFAULT 'PENDING',
  `shipping_name` varchar(255) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_province` varchar(100) NOT NULL,
  `shipping_district` varchar(100) NOT NULL,
  `shipping_ward` varchar(100) NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_fee_cents` int DEFAULT '0',
  `tracking_number` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(512) DEFAULT NULL,
  `price_cents` int NOT NULL,
  `quantity` int NOT NULL,
  `subtotal_cents` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Sample Orders Data
INSERT INTO `orders` (`user_id`, `total_cents`, `status`, `payment_method`, `payment_status`, `shipping_name`, `shipping_phone`, `shipping_province`, `shipping_district`, `shipping_ward`, `shipping_address`, `shipping_fee_cents`, `created_at`) VALUES
(2, 429000, 'DELIVERED', 'COD', 'PAID', 'Huy Hoàng Trần', '0912345678', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Hàng Bạc', '123 Phố Hàng Bạc', 30000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 359000, 'CONFIRMED', 'COD', 'PENDING', 'Nguyễn Thị Hoa', '0987654321', 'TP HCM', 'Quận 1', 'Phường Bến Nghé', '456 Nguyễn Huệ', 25000, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 659000, 'SHIPPING', 'BANK_TRANSFER', 'PAID', 'Trần Văn Minh', '0901234567', 'Đà Nẵng', 'Quận Hải Châu', 'Phường Thạch Thang', '789 Trần Phú', 20000, NOW()),
(2, 499000, 'PENDING', 'COD', 'PENDING', 'Huy Hoàng Trần', '0912345678', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Hàng Bạc', '123 Phố Hàng Bạc', 30000, NOW());

-- Sample Order Items Data
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price_cents`, `quantity`, `subtotal_cents`) VALUES
(1, 1, 'Áo Polo Nam Slim', 'https://buggy.yodycdn.com/images/product/cd39cf0670e51c752e6896c97b394308.webp', 499000, 1, 499000),
(2, 2, 'Áo Polo Nữ Phối Dây', 'https://buggy.yodycdn.com/images/product/2c304767a76d367d0782955c733fe562.webp', 329000, 1, 329000),
(3, 3, 'Áo Polo Teen', 'https://buggy.yodycdn.com/images/product/9ec366d2e107e12e8bd1ce3d3ff11699.webp', 169000, 1, 169000),
(3, 4, 'Túi Xách Nữ', 'https://buggy.yodycdn.com/images/product/32521da33ed41f1b8d186561e401e0a7.webp', 499000, 1, 499000),
(4, 1, 'Áo Polo Nam Slim', 'https://buggy.yodycdn.com/images/product/cd39cf0670e51c752e6896c97b394308.webp', 499000, 1, 499000);

CREATE TABLE `payment_methods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `active` tinyint(1) DEFAULT '1',
  `config` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payment_methods` (`code`, `name`, `description`, `active`) VALUES
('COD', 'Thanh toán khi nhận hàng', 'Thanh toán khi nhận hàng', 1),
('BANK_TRANSFER', 'Chuyển khoản ngân hàng', 'Chuyển khoản qua ngân hàng', 1),
('EWALLET', 'Ví điện tử', 'Thanh toán qua Momo, ZaloPay', 1),
('CREDIT_CARD', 'Thẻ tín dụng/ghi nợ', 'Thanh toán bằng thẻ Visa/Mastercard', 1);

CREATE TABLE `payment_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `amount_cents` int NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_provider` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  `gateway_response` json DEFAULT NULL,
  `error_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
