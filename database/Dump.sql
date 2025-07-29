-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: freethink-internship
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applicant_skills`
--

DROP TABLE IF EXISTS `applicant_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applicant_skills` (
  `uid` int NOT NULL,
  `skillid` int NOT NULL,
  PRIMARY KEY (`uid`,`skillid`),
  KEY `fk_appl_2_idx` (`skillid`),
  CONSTRAINT `fk_appl_1` FOREIGN KEY (`uid`) REFERENCES `applicants` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `fk_appl_2` FOREIGN KEY (`skillid`) REFERENCES `skills` (`skillid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `applicants`
--

DROP TABLE IF EXISTS `applicants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applicants` (
  `uid` int NOT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `resume_url_UNIQUE` (`resume_url`),
  CONSTRAINT `user_id_foreign_key` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `uid` int NOT NULL,
  `jobid` int NOT NULL,
  `applied` date DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  PRIMARY KEY (`uid`,`jobid`),
  KEY `fk_applications_2_idx` (`jobid`),
  CONSTRAINT `fk_applications_1` FOREIGN KEY (`uid`) REFERENCES `applicants` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_applications_2` FOREIGN KEY (`jobid`) REFERENCES `jobs` (`jobid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `cid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT 'No name',
  `location` varchar(100) DEFAULT 'No Loc',
  `description` mediumtext,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `eid` int NOT NULL AUTO_INCREMENT,
  `uid` int NOT NULL,
  `degree` mediumtext,
  `institution` mediumtext,
  `field_of_study` mediumtext,
  `start_date_degree` date DEFAULT NULL,
  `end_date_degree` date DEFAULT NULL,
  `grade_value` decimal(5,2) DEFAULT '0.00',
  `grade_type` enum('CGPA','PERCENT','GRADE') DEFAULT 'CGPA',
  `education_level` enum('Undergraduate','Postgraduate','Diploma','10th','12th','Phd') DEFAULT '10th',
  PRIMARY KEY (`eid`),
  KEY `fk_edu_1_idx` (`uid`),
  CONSTRAINT `fk_edu_1` FOREIGN KEY (`uid`) REFERENCES `applicants` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experience`
--

DROP TABLE IF EXISTS `experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experience` (
  `expid` int NOT NULL AUTO_INCREMENT,
  `uid` int NOT NULL,
  `expName` varchar(100) DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL,
  `start` date DEFAULT NULL,
  `end` date DEFAULT NULL,
  PRIMARY KEY (`expid`),
  KEY `fk_exp_uid_idx` (`uid`),
  CONSTRAINT `fk_exp_uid` FOREIGN KEY (`uid`) REFERENCES `applicants` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `jobid` int NOT NULL AUTO_INCREMENT,
  `uid` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` json DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `posted` date NOT NULL,
  `popularity_score` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`jobid`),
  KEY `fk_job_1_idx` (`uid`),
  CONSTRAINT `fk_job_1` FOREIGN KEY (`uid`) REFERENCES `recruiters` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recruiters`
--

DROP TABLE IF EXISTS `recruiters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiters` (
  `uid` int NOT NULL,
  `cid` int NOT NULL,
  PRIMARY KEY (`uid`),
  KEY `fk_cid_idx` (`cid`),
  CONSTRAINT `fk_cid` FOREIGN KEY (`cid`) REFERENCES `company` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `skillid` int NOT NULL AUTO_INCREMENT,
  `skillName` varchar(100) NOT NULL,
  PRIMARY KEY (`skillid`),
  UNIQUE KEY `skillName_UNIQUE` (`skillName`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT 'No name',
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('recruiter','applicant') NOT NULL DEFAULT 'applicant',
  `phone` varchar(45) DEFAULT 'None',
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `password_UNIQUE` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-29 14:02:19
