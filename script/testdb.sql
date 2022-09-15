USE [WAD-MMD-CSD-S21_10407745]
GO

SELECT *
FROM jobProfile p 
    INNER JOIN jobAccount a 
    ON p.profileid = a.FK_profileid
GO