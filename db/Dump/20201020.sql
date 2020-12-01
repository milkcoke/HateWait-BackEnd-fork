-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: us-cdbr-east-02.cleardb.com    Database: heroku_d1cc8045f99880f
-- ------------------------------------------------------
-- Server version	5.5.62-log

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
-- Table structure for table `coupon`
--

DROP TABLE IF EXISTS `coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon` (
  `issue_number` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `store_id` varchar(15) NOT NULL,
  `member_id` varchar(15) NOT NULL,
  `issue_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiration_date` date DEFAULT NULL,
  `used_date` date DEFAULT NULL,
  PRIMARY KEY (`issue_number`,`store_id`,`member_id`),
  KEY `store_id` (`store_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `coupon_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `coupon_information` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `coupon_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon`
--

LOCK TABLES `coupon` WRITE;
/*!40000 ALTER TABLE `coupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_information`
--

DROP TABLE IF EXISTS `coupon_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_information` (
  `store_id` varchar(15) NOT NULL,
  `benefit_description` varchar(50) NOT NULL,
  `maximum_stamp` int(4) unsigned NOT NULL,
  `validity_period_days` int(5) unsigned DEFAULT NULL,
  `remark` varchar(511) DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  CONSTRAINT `coupon_information_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_information`
--

LOCK TABLES `coupon_information` WRITE;
/*!40000 ALTER TABLE `coupon_information` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_information` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `phone` int(11) unsigned NOT NULL,
  `email` varchar(40) NOT NULL,
  `no_show` int(2) unsigned NOT NULL DEFAULT '0',
  `pw` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES ('jayce23@naver.c','제이스',107421572,'jayce23@naver.com',0,'$2b$10$Abf0hBn7GQkoz/pyl2EDcOGV41SpxyQuvedtevWhqwghQpeET7GVe'),('mmh','문승훈',1042122212,'mmh23@mdmd.net',0,'passww'),('syh8574@naver.c','손영호',1041212343,'syh8574@naver.com',0,'$2b$10$vNAlj4R/IfnGEaNY3hL0iezLMhHbOWjGTXwj0epNJ6jD0tPhThL2y'),('uyttyu7532@nave','조예린',1093097866,'uyttyu7532@naver.com',0,'$2b$10$shb7vQCn3snntbS8/ALMEuILyp2OeM3bFuZOGsYI6f7yiba02/ssO');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stamp`
--

DROP TABLE IF EXISTS `stamp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stamp` (
  `store_id` varchar(15) NOT NULL,
  `member_id` varchar(15) NOT NULL,
  `count` int(2) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`store_id`,`member_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `stamp_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stamp_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stamp`
--

LOCK TABLES `stamp` WRITE;
/*!40000 ALTER TABLE `stamp` DISABLE KEYS */;
/*!40000 ALTER TABLE `stamp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store` (
  `id` varchar(15) NOT NULL,
  `name` varchar(20) NOT NULL,
  `phone` int(11) unsigned NOT NULL,
  `email` varchar(40) NOT NULL,
  `info` varchar(255) DEFAULT NULL,
  `business_hour` varchar(511) DEFAULT NULL,
  `maximum_capacity` int(4) unsigned NOT NULL,
  `address` varchar(255) NOT NULL,
  `coupon_enable` tinyint(1) DEFAULT NULL,
  `pw` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store`
--

LOCK TABLES `store` WRITE;
/*!40000 ALTER TABLE `store` DISABLE KEYS */;
INSERT INTO `store` VALUES ('bani123','바니 프레소',1082018201,'bani@naver.com','토끼 그림있는 카페에요',NULL,50,'서울시 강남구 테헤란로 130-2',1,'password'),('coco1414','코코 커피',1082829381,'coco3@hanmail.net','아메리카노가 맛있는 집!',NULL,30,'서울시 강남구 테헤란로 130-8',0,'passwd'),('jy55233','예린 라볶이',318724441,'jy55233@naver.com','','평일 오전 9시 - 오후 6시 (휴무일: 주말)',50,'충청북도 충주시 기면읍 15',0,'$2b$10$2KdoSmy.xhtkJLK35b6uROiX0TndqVBgq41/r2R7YwueAUKNuv6mS'),('jyl2233','예린 떡볶이',3187248421,'jyl2233@naver.com','',NULL,50,'충청북도 충주시 기면읍 15',0,'$2b$10$9BJh3XEPqmuEgIzQGJozb.7qrk67agQrVlRfx7hxZMnB1CQLXLFte');
/*!40000 ALTER TABLE `store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_log`
--

DROP TABLE IF EXISTS `visit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_log` (
  `visit_time` datetime NOT NULL,
  `store_id` varchar(15) NOT NULL,
  `customer_number` int(2) unsigned NOT NULL,
  `member_id` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`visit_time`,`store_id`),
  KEY `store_id` (`store_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `visit_log_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visit_log_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_log`
--

LOCK TABLES `visit_log` WRITE;
/*!40000 ALTER TABLE `visit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiting_customer`
--

DROP TABLE IF EXISTS `waiting_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiting_customer` (
  `phone` int(11) unsigned NOT NULL,
  `store_id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `people_number` int(2) unsigned NOT NULL,
  `is_member` tinyint(1) NOT NULL,
  PRIMARY KEY (`phone`,`store_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `waiting_customer_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiting_customer`
--

LOCK TABLES `waiting_customer` WRITE;
/*!40000 ALTER TABLE `waiting_customer` DISABLE KEYS */;
INSERT INTO `waiting_customer` VALUES (1082729819,'bani123','멍멍잉',4,0);
/*!40000 ALTER TABLE `waiting_customer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-10-20 14:27:56
