USE [WAD-MMD-CSD-S21_10407745]
GO

-- SELECT *
-- FROM jobProfile p 
--     INNER JOIN jobAccount a 
--     ON p.profileid = a.FK_profileid
-- GO

SELECT *
FROM jobTask t 
INNER JOIN jobAccount ac
ON t.FK_accountid = ac.accountid
    INNER JOIN jobProfile p
    ON ac.FK_profileid = p.profileid
GO