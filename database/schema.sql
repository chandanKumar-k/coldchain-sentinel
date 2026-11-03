-- ColdChain Sentinel: MySQL schema (SENSOR_READING lives in MongoDB)
DROP DATABASE IF EXISTS coldchain_sentinel;
CREATE DATABASE coldchain_sentinel;
USE coldchain_sentinel;

CREATE TABLE product (product_id INT AUTO_INCREMENT PRIMARY KEY, product_name VARCHAR(100) NOT NULL UNIQUE);
CREATE TABLE facility (facility_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL, location VARCHAR(120) NOT NULL);
CREATE TABLE storage_unit (
  storage_unit_id INT AUTO_INCREMENT PRIMARY KEY, facility_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','MAINTENANCE','OFFLINE')),
  FOREIGN KEY (facility_id) REFERENCES facility(facility_id));
CREATE TABLE batch (
  batch_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, facility_id INT NOT NULL,
  batch_number VARCHAR(30) NOT NULL UNIQUE, expiry_date DATE NOT NULL,
  FOREIGN KEY (product_id) REFERENCES product(product_id),
  FOREIGN KEY (facility_id) REFERENCES facility(facility_id));
CREATE TABLE sensor (
  sensor_id INT AUTO_INCREMENT PRIMARY KEY, storage_unit_id INT NOT NULL, sensor_code VARCHAR(30) NOT NULL UNIQUE,
  FOREIGN KEY (storage_unit_id) REFERENCES storage_unit(storage_unit_id));
CREATE TABLE excursion (
  excursion_id INT AUTO_INCREMENT PRIMARY KEY, batch_id INT NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  duration INT NOT NULL CHECK (duration >= 0), -- minutes
  FOREIGN KEY (batch_id) REFERENCES batch(batch_id));
CREATE TABLE risk_assessment (
  risk_id INT AUTO_INCREMENT PRIMARY KEY, excursion_id INT NOT NULL UNIQUE, -- UNIQUE => 1:1
  risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  FOREIGN KEY (excursion_id) REFERENCES excursion(excursion_id));
CREATE TABLE alert (
  alert_id INT AUTO_INCREMENT PRIMARY KEY, batch_id INT NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status VARCHAR(15) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
  FOREIGN KEY (batch_id) REFERENCES batch(batch_id));
CREATE TABLE inspection (
  inspection_id INT AUTO_INCREMENT PRIMARY KEY, alert_id INT NOT NULL, inspection_date DATE NOT NULL,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('CLEARED','CONTINUE_QUARANTINE','DISPOSE')),
  FOREIGN KEY (alert_id) REFERENCES alert(alert_id));

-- Indexes (speed up joins/filters)
CREATE INDEX idx_batch_product ON batch(product_id);
CREATE INDEX idx_batch_facility ON batch(facility_id);
CREATE INDEX idx_batch_expiry ON batch(expiry_date);
CREATE INDEX idx_excursion_batch ON excursion(batch_id);
CREATE INDEX idx_alert_batch ON alert(batch_id);
CREATE INDEX idx_alert_status ON alert(status);

CREATE VIEW active_alerts AS
SELECT a.alert_id, b.batch_number, p.product_name, a.severity, a.status
FROM alert a JOIN batch b ON a.batch_id=b.batch_id JOIN product p ON b.product_id=p.product_id
WHERE a.status <> 'RESOLVED';

DELIMITER //
CREATE TRIGGER create_critical_alert AFTER INSERT ON excursion FOR EACH ROW
BEGIN
  IF NEW.severity='CRITICAL' THEN
    INSERT INTO alert(batch_id,severity,status) VALUES (NEW.batch_id,'CRITICAL','OPEN');
  END IF;
END//
CREATE PROCEDURE AddExcursion(IN p_batch INT, IN p_sev VARCHAR(10), IN p_dur INT)
BEGIN INSERT INTO excursion(batch_id,severity,duration) VALUES (p_batch,p_sev,p_dur); END//
CREATE PROCEDURE RecordExcursionWithRisk(IN p_batch INT, IN p_sev VARCHAR(10), IN p_dur INT, IN p_score INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  INSERT INTO excursion(batch_id,severity,duration) VALUES (p_batch,p_sev,p_dur);
  INSERT INTO risk_assessment(excursion_id,risk_score) VALUES (LAST_INSERT_ID(),p_score);
  COMMIT;
END//
DELIMITER ;

-- DDL demos: ALTER TABLE facility ADD COLUMN phone VARCHAR(20);
-- CREATE TABLE tmp_log (id INT); TRUNCATE TABLE tmp_log; RENAME TABLE tmp_log TO temp_log; DROP TABLE temp_log;
