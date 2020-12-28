-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: us-cdbr-east-02.cleardb.com    Database: heroku_d1cc8045f99880f
-- ------------------------------------------------------
-- Server version	5.5.62-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
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
 SET character_set_client = utf8mb4 ;
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
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon`
--

LOCK TABLES `coupon` WRITE;
/*!40000 ALTER TABLE `coupon` DISABLE KEYS */;
INSERT INTO `coupon` VALUES (1,'bani123','uyttyu7532','2020-11-05 15:33:02','2020-11-06',NULL),(2,'bani123','syh8574','2020-11-05 15:38:07','2020-11-05',NULL);
/*!40000 ALTER TABLE `coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_information`
--

DROP TABLE IF EXISTS `coupon_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
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
INSERT INTO `coupon_information` VALUES ('bani123','헤이즐넛 아메리카노 1잔 (Tall)',8,365,'주말에는 사용 불가능합니다.');
/*!40000 ALTER TABLE `coupon_information` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `member` (
  `id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `email` varchar(40) NOT NULL,
  `no_show` int(2) unsigned NOT NULL DEFAULT '0',
  `pw` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `phone_3` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES ('syh8574','손영호','1041212343','syh8574@naver.com',0,'$2b$10$vNAlj4R/IfnGEaNY3hL0iezLMhHbOWjGTXwj0epNJ6jD0tPhThL2y'),('uyttyu7532','조예린','1093097866','uyttyu7532@naver.com',0,'$2b$10$shb7vQCn3snntbS8/ALMEuILyp2OeM3bFuZOGsYI6f7yiba02/ssO');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stamp`
--

DROP TABLE IF EXISTS `stamp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
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
INSERT INTO `stamp` VALUES ('bani123','syh8574',3);
/*!40000 ALTER TABLE `stamp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `store` (
  `id` varchar(15) NOT NULL,
  `name` varchar(20) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `email` varchar(40) NOT NULL,
  `info` varchar(255) DEFAULT NULL,
  `business_hour` varchar(511) DEFAULT NULL,
  `maximum_capacity` int(4) unsigned NOT NULL,
  `address` varchar(255) NOT NULL,
  `coupon_enable` tinyint(1) DEFAULT NULL,
  `pw` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store`
--

LOCK TABLES `store` WRITE;
/*!40000 ALTER TABLE `store` DISABLE KEYS */;
INSERT INTO `store` VALUES ('bani123','바니 프레소','1089875421','bani@naver.com','토끼 그림있는 카페에요',NULL,100,'서울시 강남구 테헤란로 130-2',1,'pw123'),('coco1414','코코 커피','1082829381','coco3@hanmail.net','아메리카노가 맛있는 집!',NULL,30,'서울시 강남구 테헤란로 130-8',1,'jayce'),('dibo5522','디보 철거상','234513512','dibo5522@naver.com','철거 쥑인다','평일 오전 10시 - 오후 5시\n연중무휴',10,'경상남도 김해시 읍주군 50-2길',0,'$2b$10$rxr0N564seMjASraJcGkfOJrOdrH//xDT.Tl8Wm6k4AyWvlbSuBQG'),('hate2020','우주최고맛집','233336666','uyttyu7532@naver.com','우주 최고의 맛집입니다','오전 1:30 - 오전 1:30 (휴무 요일 : 월, 화, 수, 목, 금, 토, 일)',49,'(62395) 광주 광산구 산정동 734 (35.1721893,126.79202639999998)',0,'$2b$10$5Hic7EvhArd/gS0/cJduQOfbuu16mFb6sgkXAFFeMwgpdvZqccLOK'),('jy55233','예린 라볶이','318724441','jy55233@naver.com','','평일 오전 9시 - 오후 6시 (휴무일: 주말)',50,'충청북도 충주시 기면읍 15',0,'$2b$10$2KdoSmy.xhtkJLK35b6uROiX0TndqVBgq41/r2R7YwueAUKNuv6mS'),('jyl2233','예린 떡볶이','3187248421','jyl2233@naver.com','',NULL,50,'충청북도 충주시 기면읍 15',0,'$2b$10$9BJh3XEPqmuEgIzQGJozb.7qrk67agQrVlRfx7hxZMnB1CQLXLFte');
/*!40000 ALTER TABLE `store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_log`
--

DROP TABLE IF EXISTS `visit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `visit_log` (
  `visit_time` datetime NOT NULL,
  `store_id` varchar(15) NOT NULL,
  `customer_number` int(2) unsigned NOT NULL,
  `member_id` varchar(15) DEFAULT NULL,
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
INSERT INTO `visit_log` VALUES ('2020-09-07 12:58:17','bani123',5,'uyttyu7532'),('2020-10-05 12:58:53','bani123',5,'syh8574'),('2020-10-05 12:59:12','bani123',5,'uyttyu7532'),('2020-10-07 12:58:40','bani123',5,'syh8574'),('2020-11-04 11:50:43','bani123',15,NULL),('2020-11-05 10:26:56','bani123',6,NULL),('2020-11-05 15:56:49','bani123',5,'syh8574'),('2020-11-07 10:26:26','bani123',10,NULL),('2020-11-07 10:26:32','bani123',5,NULL),('2020-11-07 10:26:36','bani123',3,NULL);
/*!40000 ALTER TABLE `visit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiting_customer`
--

DROP TABLE IF EXISTS `waiting_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `waiting_customer` (
  `phone` varchar(12) NOT NULL,
  `store_id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `people_number` int(2) unsigned NOT NULL,
  `called_time` timestamp NULL DEFAULT NULL,
  `is_member` tinyint(1) NOT NULL,
  PRIMARY KEY (`phone`,`store_id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `waiting_customer_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiting_customer`
--

LOCK TABLES `waiting_customer` WRITE;
/*!40000 ALTER TABLE `waiting_customer` DISABLE KEYS */;
INSERT INTO `waiting_customer` VALUES ('1010251153','bani123','오삼',53,'0000-00-00 00:00:00',0),('1010261235','bani123','비회언',5,'0000-00-00 00:00:00',0),('1041212343','bani123','손영호',6,'0000-00-00 00:00:00',1),('1042122212','bani123','문승훈',5,'2020-11-04 12:45:19',1),('1055554444','bani123','조예린',2,NULL,0),('1066665555','bani123','리스트',6,'0000-00-00 00:00:00',0),('1077421561','bani123','자르반',1,'0000-00-00 00:00:00',0),('1087513542','bani123','곰돌이푸',4,'0000-00-00 00:00:00',0),('1093097866','bani123','조예린',5,NULL,1);
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

-- Dump completed on 2020-11-08 15:34:00
