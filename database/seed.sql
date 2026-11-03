USE coldchain_sentinel;
INSERT INTO product(product_name) VALUES ('Insulin'),('COVID Vaccine'),('Blood Plasma');
INSERT INTO facility(name,location) VALUES ('Central Cold Storage','Bangalore'),('City Hospital','Bangalore'),('Distribution Centre','Mysore');
INSERT INTO storage_unit(facility_id,status) VALUES (1,'ACTIVE'),(2,'ACTIVE'),(3,'MAINTENANCE');
INSERT INTO sensor(storage_unit_id,sensor_code) VALUES (1,'TEMP-001'),(2,'TEMP-002'),(3,'TEMP-003');
INSERT INTO batch(product_id,facility_id,batch_number,expiry_date) VALUES
 (1,1,'INS-001','2027-03-31'),(2,2,'VAC-004','2026-11-15'),(3,3,'BLOOD-007','2026-10-20'),(1,2,'INS-002','2027-06-30');
INSERT INTO excursion(batch_id,severity,duration) VALUES (2,'HIGH',40),(3,'MEDIUM',20),(4,'LOW',5);
INSERT INTO alert(batch_id,severity,status) VALUES (2,'HIGH','OPEN'),(3,'MEDIUM','ACKNOWLEDGED');
INSERT INTO excursion(batch_id,severity,duration) VALUES (1,'CRITICAL',75); -- trigger creates CRITICAL alert
INSERT INTO risk_assessment(excursion_id,risk_score) VALUES (1,68),(2,45),(3,15),(4,92);
INSERT INTO inspection(alert_id,inspection_date,decision) VALUES (2,'2026-09-25','CONTINUE_QUARANTINE');
