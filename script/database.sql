USE [WAD-MMD-CSD-S21_10407015]
GO

--------------- 1) dropping all the tables and contraints
ALTER TABLE jobPassword
DROP CONSTRAINT IF EXISTS jobFK_Password_Account
GO
DROP TABLE IF EXISTS jobPassword
GO

ALTER TABLE jobTask
DROP CONSTRAINT IF EXISTS jobFK_Task_Account 
GO
DROP TABLE IF EXISTS jobTask
GO

ALTER TABLE jobAccount
DROP CONSTRAINT IF EXISTS jobFK_Account_Profile 
GO
ALTER TABLE jobAccount
DROP CONSTRAINT IF EXISTS jobFK_Account_Role
GO
DROP TABLE IF EXISTS jobAccount
GO

DROP TABLE IF EXISTS jobProfile
GO

DROP TABLE IF EXISTS jobRole
GO



--------------- 2) table definitions
CREATE TABLE jobRole
(
    roleid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key: roleid
    rolename NVARCHAR(50) NOT NULL,
    roledescription NVARCHAR(255)
)
GO

CREATE TABLE jobProfile
(
    profileid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key: profileid
    firstname NVARCHAR(50) NOT NULL,
    lastname NVARCHAR(50) NOT NULL,
    phonenumber INT NOT NULL UNIQUE,
    profiledescription NVARCHAR(255),
    profilepicture IMAGE --??????? or VARBINARY(MAX)
)
GO

CREATE TABLE jobAccount
(
    accountid INT NOT NULL IDENTITY PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    FK_profileid INT NOT NULL,
    FK_roleid INT NOT NULL,

    CONSTRAINT jobFK_Account_Profile FOREIGN KEY (FK_profileid) REFERENCES jobProfile (profileid),
    CONSTRAINT jobFK_Account_Role FOREIGN KEY (FK_roleid) REFERENCES jobRole (roleid)
)
GO

CREATE TABLE jobTask
(
    taskid INT NOT NULL IDENTITY PRIMARY KEY,
    tasktitle NVARCHAR(50) NOT NULL,
    taskdescription NVARCHAR(255) NOT NULL,
    taskcity NVARCHAR(50) NOT NULL,
    taskzipcode INT NOT NULL,
    taskstreetname NVARCHAR(255) NOT NULL,
    -- taskdate INT --- ?????????????????,
    --taskyear INT NOT NULL, taskmonth, taskyear? What if its not only one day, but  a longer period of time
    FK_accountid INT NOT NULL,

    CONSTRAINT jobFK_Task_Account FOREIGN KEY (FK_accountid) REFERENCES jobAccount (accountid)
)
GO

CREATE TABLE jobPassword
(
    FK_accountid INT NOT NULL,
    hashedpassword NVARCHAR(255) NOT NULL

    CONSTRAINT jobFK_Password_Account FOREIGN KEY (FK_accountid) REFERENCES jobAccount (accountid)
)
GO





-------- 3) populating test data
INSERT INTO jobRole 
    ([rolename], [roledescription])
    VALUES
    ('admin', 'can add and delete all posts'),
    ('member', 'can add posts')
GO

INSERT INTO jobProfile
    ([firstname], [lastname], [phonenumber], [profiledescription], [profilepicture])
    VALUES
    ('Jan', 'Kowalski', '45892642', 'Hello bla bla bla here i am', NULL)
GO

INSERT INTO jobAccount 
    ([email], [FK_profileid], [FK_roleid])
    VALUES 
    ('ralala@gmai.com', 1, 2)
GO

INSERT INTO jobTask
    ([tasktitle], [taskdescription], [taskcity], [taskzipcode], [taskstreetname], [FK_accountid])
    VALUES
    ('babysitter', 'Help with the child', 'Aalborg', '9000', 'Nytorv', 1)
GO

INSERT INTO jobPassword 
    ([FK_accountid], [hashedpassword])
    VALUES
    (1, '012938475483@#$')
GO




------------ 4) verifying the database
SELECT * FROM jobAccount a 
    INNER JOIN jobPassword p
    ON a.accountid = p.FK_accountid
        INNER JOIN jobProfile pr 
        ON a.FK_profileid = pr.profileid
            INNER JOIN jobTask t
            ON t.FK_accountid = a.accountid
                INNER JOIN jobRole r 
                ON a.FK_roleid = r.roleid
                ORDER BY a.accountid
GO