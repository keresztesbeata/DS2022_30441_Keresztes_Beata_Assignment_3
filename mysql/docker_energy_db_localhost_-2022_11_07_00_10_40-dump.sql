-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: energy-db
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account`
(
    `id`       varchar(36)  NOT NULL,
    `name`     varchar(100) NOT NULL,
    `password` varchar(100) NOT NULL,
    `role`     varchar(255) NOT NULL,
    `username` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_gex1lmaqpg0ir5g1f5eftyaa1` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK
TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account`
VALUES ('4371c421-d90b-4ff5-91d5-9ea2215c40aa', 'Tony Stark',
        '$2a$10$WNnxapxzE3Y9m4.Ce2GQp.Lb5HX6eUBZUo5CGqGM74MR/EESpF142', 'CLIENT', 'iron_man'),
       ('6213bc4b-013e-4a0a-bb97-195f255bb6bc', 'Stephen Strange',
        '$2a$10$OfWhsXSXB/u9HxX8rYQC4.sLkFL0iNwcoxYKtPa9shj.fgMT90P7i', 'CLIENT', 'dr_strange'),
       ('c3f8b3f3-67eb-4615-aeb1-8e08d9d4720c', 'admin', '$2a$10$IxfRW1MyZ3bCWPZ.ZkS43eJoXSE204Qg3KC8ZbhcG/d2dKfAc0XVi',
        'ADMIN', 'admin'),
       ('f282a410-b9ab-42e6-a4be-13f3b50ae2a6', 'Thor Odinson',
        '$2a$10$BdA4WmzRlaLu9.XyVA7xL.HUJqXRY3Vxzi9/pJzx8BUODj3WUPVlK', 'CLIENT', 'thor');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK
TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device`
(
    `id`                            varchar(36) NOT NULL,
    `address`                       varchar(300) DEFAULT NULL,
    `description`                   varchar(500) DEFAULT NULL,
    `max_hourly_energy_consumption` float        DEFAULT '0',
    `account_id`                    varchar(36)  DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY                             `FKaigctov0rj5f048cd1ckauoov` (`account_id`),
    CONSTRAINT `FKaigctov0rj5f048cd1ckauoov` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK
TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device`
VALUES ('1e115b42-8ef1-4c3e-a585-7ab0d98cc74e', 'London, Victoria street, 32, living room', 'LG TV', 0,
        '4371c421-d90b-4ff5-91d5-9ea2215c40aa'),
       ('2565d8ee-5f68-40c2-9ccc-1d640432818c', 'London, Victoria street, 32, bathroom', 'Electrolux Washing machine',
        0, '4371c421-d90b-4ff5-91d5-9ea2215c40aa'),
       ('3ace9092-7fa6-485a-9b9f-d52a7d71d6a3', 'London, Victoria street, 32, kitchen', 'DeLonghi Coffee machine', 0,
        '4371c421-d90b-4ff5-91d5-9ea2215c40aa'),
       ('c38a46f0-dcb6-42ed-ac78-57742a9813a9', 'London, Victoria street, 32, bathroom',
        'Electrolux Dry Cleaning machine', 0, '4371c421-d90b-4ff5-91d5-9ea2215c40aa'),
       ('cd8d9391-2c5c-4c2e-86e3-60853d1cd814', 'London, Victoria street, 32, kitchen', 'Electric stove', 0,
        'f282a410-b9ab-42e6-a4be-13f3b50ae2a6'),
       ('d602e8f4-67d9-491b-84b0-156145546f02', 'London, Victoria street, 32, kitchen', 'Philips Refrigerator', 0,
        '4371c421-d90b-4ff5-91d5-9ea2215c40aa'),
       ('dbc3a3ec-cb0d-4c07-934a-a3ec46602475', 'London, Victoria street, 32, living room', 'Floor Lamps', 0,
        '4371c421-d90b-4ff5-91d5-9ea2215c40aa');
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK
TABLES;

--
-- Table structure for table `energy_consumption`
--

DROP TABLE IF EXISTS `energy_consumption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `energy_consumption`
(
    `id`        int         NOT NULL,
    `energy`    float    DEFAULT NULL,
    `timestamp` datetime DEFAULT NULL,
    `device_id` varchar(36) NOT NULL,
    PRIMARY KEY (`id`),
    KEY         `FK7cjx5e0uq41oxj8scflvtehny` (`device_id`),
    CONSTRAINT `FK7cjx5e0uq41oxj8scflvtehny` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `energy_consumption`
--

LOCK
TABLES `energy_consumption` WRITE;
/*!40000 ALTER TABLE `energy_consumption` DISABLE KEYS */;
INSERT INTO `energy_consumption`
VALUES (1, 2.25, '2022-11-06 08:52:21', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (2, 5.4, '2022-11-06 09:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (3, 4.3, '2022-11-06 10:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (4, 3.9, '2022-11-06 11:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (5, 0, '2022-11-06 12:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (6, 0, '2022-11-06 13:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (7, 0, '2022-11-06 14:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (8, 0, '2022-11-06 15:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (9, 0, '2022-11-06 16:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (10, 4.5, '2022-11-06 17:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (11, 5.6, '2022-11-06 18:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (12, 4.7, '2022-11-06 19:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (13, 3.8, '2022-11-06 20:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (14, 0, '2022-11-06 21:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (15, 0, '2022-11-06 22:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (16, 0, '2022-11-06 23:52:25', '2565d8ee-5f68-40c2-9ccc-1d640432818c'),
       (17, 0, '2022-11-06 06:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (18, 1.3, '2022-11-06 06:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (19, 1.5, '2022-11-06 07:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (20, 2, '2022-11-06 08:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (21, 0.5, '2022-11-06 09:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (22, 0, '2022-11-06 10:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (23, 0, '2022-11-06 11:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (24, 0, '2022-11-06 12:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (25, 0, '2022-11-06 13:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (26, 0, '2022-11-06 14:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (27, 1.7, '2022-11-06 15:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (28, 1.3, '2022-11-06 16:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (29, 1.5, '2022-11-06 17:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (30, 0, '2022-11-06 18:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (31, 0, '2022-11-06 19:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (32, 0, '2022-11-06 20:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (33, 0, '2022-11-06 21:57:19', '3ace9092-7fa6-485a-9b9f-d52a7d71d6a3'),
       (34, 2.25, '2022-11-06 08:52:21', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (35, 2.4, '2022-11-06 09:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (36, 2.3, '2022-11-06 10:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (37, 3, '2022-11-06 11:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (38, 1.2, '2022-11-06 12:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (39, 1.9, '2022-11-06 13:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (40, 3.6, '2022-11-06 14:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (41, 3.8, '2022-11-06 15:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (42, 2.7, '2022-11-06 16:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (43, 4, '2022-11-06 17:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (44, 3.1, '2022-11-06 18:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (45, 3.2, '2022-11-06 19:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (46, 3.12, '2022-11-06 20:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (47, 2.5, '2022-11-06 21:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (48, 2.1, '2022-11-06 22:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (49, 2, '2022-11-06 23:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (50, 2.1, '2022-11-06 00:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (51, 2, '2022-11-06 01:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (52, 2.12, '2022-11-06 02:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (53, 2.25, '2022-11-06 03:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (54, 2.12, '2022-11-06 04:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (55, 2.23, '2022-11-06 05:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (56, 2.2, '2022-11-06 06:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02'),
       (57, 2.18, '2022-11-06 07:52:25', 'd602e8f4-67d9-491b-84b0-156145546f02');
/*!40000 ALTER TABLE `energy_consumption` ENABLE KEYS */;
UNLOCK
TABLES;

--
-- Table structure for table `hibernate_sequence`
--

DROP TABLE IF EXISTS `hibernate_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hibernate_sequence`
(
    `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hibernate_sequence`
--

LOCK
TABLES `hibernate_sequence` WRITE;
/*!40000 ALTER TABLE `hibernate_sequence` DISABLE KEYS */;
INSERT INTO `hibernate_sequence`
VALUES (1);
/*!40000 ALTER TABLE `hibernate_sequence` ENABLE KEYS */;
UNLOCK
TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-07  0:10:40
