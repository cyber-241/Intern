-- =====================================================
-- HỆ THỐNG CHẤM CÔNG - ATTENDANCE MANAGEMENT SYSTEM
-- SQL Server Database Script
-- Tạo bởi: AttendPro Team
-- Ngày tạo: 2026-07-03
-- =====================================================

-- Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AttendanceDB')
BEGIN
    CREATE DATABASE AttendanceDB;
END
GO

USE AttendanceDB;
GO

-- =====================================================
-- 1. BẢNG PHÒNG BAN (Departments)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Departments' AND xtype = 'U')
BEGIN
    CREATE TABLE Departments (
        DepartmentId    INT IDENTITY(1,1) PRIMARY KEY,
        DepartmentCode  NVARCHAR(20) NOT NULL UNIQUE,
        DepartmentName  NVARCHAR(100) NOT NULL,
        Description     NVARCHAR(255),
        ManagerId       INT NULL,
        Phone           NVARCHAR(20),
        IsActive        BIT DEFAULT 1,
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- 2. BẢNG CHỨC VỤ (Positions)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Positions' AND xtype = 'U')
BEGIN
    CREATE TABLE Positions (
        PositionId      INT IDENTITY(1,1) PRIMARY KEY,
        PositionCode    NVARCHAR(20) NOT NULL UNIQUE,
        PositionName    NVARCHAR(100) NOT NULL,
        Description     NVARCHAR(255),
        BaseSalary      DECIMAL(18,0) NOT NULL DEFAULT 0,
        Level           INT NOT NULL DEFAULT 1,
        IsActive        BIT DEFAULT 1,
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- 3. BẢNG NHÂN VIÊN (Employees)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Employees' AND xtype = 'U')
BEGIN
    CREATE TABLE Employees (
        EmployeeId      INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeCode    NVARCHAR(20) NOT NULL UNIQUE,
        FullName        NVARCHAR(100) NOT NULL,
        Email           NVARCHAR(150) UNIQUE,
        Phone           NVARCHAR(20),
        Gender          NVARCHAR(10) CHECK (Gender IN (N'Nam', N'Nữ', N'Khác')),
        DateOfBirth     DATE,
        Address         NVARCHAR(255),
        DepartmentId    INT NOT NULL,
        PositionId      INT NOT NULL,
        Salary          DECIMAL(18,0) NOT NULL DEFAULT 0,
        HireDate        DATE NOT NULL,
        IsActive        BIT DEFAULT 1,
        Avatar          NVARCHAR(255),
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Employees_Department FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),
        CONSTRAINT FK_Employees_Position FOREIGN KEY (PositionId) REFERENCES Positions(PositionId)
    );
END
GO

-- =====================================================
-- 4. BẢNG QUY ĐỊNH TRỪ LƯƠNG KHI ĐI TRỄ (SalaryDeductions)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'SalaryDeductions' AND xtype = 'U')
BEGIN
    CREATE TABLE SalaryDeductions (
        DeductionId     INT IDENTITY(1,1) PRIMARY KEY,
        DeductionName   NVARCHAR(100) NOT NULL,
        MinLateMinutes  INT NOT NULL,
        MaxLateMinutes  INT NOT NULL,
        DeductionAmount DECIMAL(18,0) NOT NULL,
        Description     NVARCHAR(255),
        IsActive        BIT DEFAULT 1,
        CreatedAt       DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- 5. BẢNG CHẤM CÔNG (AttendanceRecords)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'AttendanceRecords' AND xtype = 'U')
BEGIN
    CREATE TABLE AttendanceRecords (
        AttendanceId    INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT NOT NULL,
        WorkDate        DATE NOT NULL,
        CheckInTime     TIME,
        CheckOutTime    TIME,
        Status          NVARCHAR(30) CHECK (Status IN (N'Đúng giờ', N'Đi trễ', N'Đang làm việc', N'Vắng mặt', N'Nghỉ phép')),
        LateMinutes     INT DEFAULT 0,
        EarlyLeaveMinutes INT DEFAULT 0,
        DeductionAmount DECIMAL(18,0) DEFAULT 0,
        Note            NVARCHAR(255),
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Attendance_Employee FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
        CONSTRAINT UQ_Employee_WorkDate UNIQUE (EmployeeId, WorkDate)
    );
END
GO

-- =====================================================
-- 6. BẢNG ĐƠN XIN NGHỈ PHÉP (LeaveRequests)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'LeaveRequests' AND xtype = 'U')
BEGIN
    CREATE TABLE LeaveRequests (
        LeaveId         INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT NOT NULL,
        LeaveType       NVARCHAR(50) CHECK (LeaveType IN (N'Nghỉ phép năm', N'Nghỉ ốm', N'Nghỉ không lương', N'Nghỉ thai sản', N'Nghỉ cưới')),
        StartDate       DATE NOT NULL,
        EndDate         DATE NOT NULL,
        TotalDays       INT NOT NULL,
        Reason          NVARCHAR(500),
        Status          NVARCHAR(30) DEFAULT N'Chờ duyệt' CHECK (Status IN (N'Chờ duyệt', N'Đã duyệt', N'Từ chối')),
        ApprovedBy      INT NULL,
        ApprovedDate    DATETIME NULL,
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Leave_Employee FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
        CONSTRAINT FK_Leave_Approver FOREIGN KEY (ApprovedBy) REFERENCES Employees(EmployeeId)
    );
END
GO

-- =====================================================
-- THÊM DỮ LIỆU MẪU
-- =====================================================

-- ===== 1. Phòng ban =====
INSERT INTO Departments (DepartmentCode, DepartmentName, Description, Phone) VALUES
(N'PB-KT', N'Phòng Kỹ Thuật', N'Phụ trách phát triển phần mềm và hệ thống IT', N'028-1234-5601'),
(N'PB-NS', N'Phòng Nhân Sự', N'Quản lý tuyển dụng, đào tạo và phúc lợi nhân viên', N'028-1234-5602'),
(N'PB-MKT', N'Phòng Marketing', N'Chiến lược marketing và truyền thông thương hiệu', N'028-1234-5603'),
(N'PB-KeTo', N'Phòng Kế Toán', N'Quản lý tài chính, kế toán và thuế', N'028-1234-5604'),
(N'PB-KD', N'Phòng Kinh Doanh', N'Phát triển kinh doanh và chăm sóc khách hàng', N'028-1234-5605'),
(N'PB-HC', N'Phòng Hành Chính', N'Quản lý hành chính, văn phòng và hậu cần', N'028-1234-5606');
GO

-- ===== 2. Chức vụ =====
INSERT INTO Positions (PositionCode, PositionName, Description, BaseSalary, Level) VALUES
(N'CV-GD', N'Giám Đốc', N'Lãnh đạo cấp cao, quản lý điều hành toàn công ty', 50000000, 5),
(N'CV-PGD', N'Phó Giám Đốc', N'Hỗ trợ Giám đốc quản lý các hoạt động công ty', 40000000, 4),
(N'CV-TP', N'Trưởng Phòng', N'Quản lý và điều hành hoạt động phòng ban', 30000000, 3),
(N'CV-PP', N'Phó Phòng', N'Hỗ trợ Trưởng phòng quản lý công việc phòng ban', 22000000, 2),
(N'CV-NV', N'Nhân Viên', N'Thực hiện công việc chuyên môn theo phân công', 15000000, 1),
(N'CV-TTS', N'Thực Tập Sinh', N'Học việc và hỗ trợ công việc tại phòng ban', 5000000, 0);
GO

-- ===== 3. Nhân viên (25 người) =====
INSERT INTO Employees (EmployeeCode, FullName, Email, Phone, Gender, DateOfBirth, Address, DepartmentId, PositionId, Salary, HireDate) VALUES
-- Phòng Kỹ Thuật (6 người)
(N'EMP-1001', N'Trần Văn Minh', N'minh.tv@attendpro.vn', N'0901234501', N'Nam', '1985-03-15', N'123 Nguyễn Huệ, Q1, TP.HCM', 1, 3, 32000000, '2020-01-10'),
(N'EMP-1002', N'Nguyễn Bảo Hân', N'han.nb@attendpro.vn', N'0901234502', N'Nữ', '1995-07-22', N'456 Lê Lợi, Q3, TP.HCM', 1, 5, 15000000, '2024-06-15'),
(N'EMP-1003', N'Lê Hoàng Nam', N'nam.lh@attendpro.vn', N'0901234503', N'Nam', '1992-11-08', N'789 Trần Hưng Đạo, Q5, TP.HCM', 1, 5, 18000000, '2023-03-01'),
(N'EMP-1004', N'Phạm Thị Mai', N'mai.pt@attendpro.vn', N'0901234504', N'Nữ', '1998-04-12', N'321 Hai Bà Trưng, Q1, TP.HCM', 1, 6, 5000000, '2026-01-15'),
(N'EMP-1005', N'Võ Đình Khoa', N'khoa.vd@attendpro.vn', N'0901234505', N'Nam', '1990-09-30', N'654 Nguyễn Trãi, Q5, TP.HCM', 1, 4, 24000000, '2021-07-01'),
(N'EMP-1006', N'Đặng Minh Tuấn', N'tuan.dm@attendpro.vn', N'0901234506', N'Nam', '1993-01-25', N'987 Cách Mạng Tháng 8, Q10, TP.HCM', 1, 5, 17000000, '2023-09-01'),

-- Phòng Nhân Sự (4 người)
(N'EMP-2001', N'Nguyễn Thị Lan', N'lan.nt@attendpro.vn', N'0912345601', N'Nữ', '1988-06-20', N'111 Võ Văn Tần, Q3, TP.HCM', 2, 3, 30000000, '2019-05-01'),
(N'EMP-2002', N'Hoàng Văn Đức', N'duc.hv@attendpro.vn', N'0912345602', N'Nam', '1994-12-05', N'222 Pasteur, Q1, TP.HCM', 2, 5, 16000000, '2023-08-15'),
(N'EMP-2003', N'Trịnh Thanh Hà', N'ha.tt@attendpro.vn', N'0912345603', N'Nữ', '1996-02-14', N'333 Lý Tự Trọng, Q1, TP.HCM', 2, 5, 15000000, '2024-02-01'),
(N'EMP-2004', N'Bùi Quang Huy', N'huy.bq@attendpro.vn', N'0912345604', N'Nam', '1991-08-08', N'444 Điện Biên Phủ, Q3, TP.HCM', 2, 4, 22000000, '2021-11-01'),

-- Phòng Marketing (4 người)
(N'EMP-3001', N'Lý Thị Ngọc', N'ngoc.lt@attendpro.vn', N'0923456701', N'Nữ', '1989-10-10', N'555 Lê Duẩn, Q1, TP.HCM', 3, 3, 28000000, '2020-03-15'),
(N'EMP-3002', N'Phan Minh Quân', N'quan.pm@attendpro.vn', N'0923456702', N'Nam', '1997-05-18', N'666 Nguyễn Đình Chiểu, Q3, TP.HCM', 3, 5, 14000000, '2025-01-10'),
(N'EMP-3003', N'Ngô Thùy Dương', N'duong.nt@attendpro.vn', N'0923456703', N'Nữ', '1995-03-28', N'777 Bùi Thị Xuân, Q1, TP.HCM', 3, 5, 16000000, '2023-06-01'),
(N'EMP-3004', N'Hồ Tấn Phát', N'phat.ht@attendpro.vn', N'0923456704', N'Nam', '1999-07-07', N'888 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 3, 6, 5000000, '2026-03-01'),

-- Phòng Kế Toán (4 người)
(N'EMP-4001', N'Dương Thị Kim', N'kim.dt@attendpro.vn', N'0934567801', N'Nữ', '1987-04-25', N'100 Nguyễn Thị Minh Khai, Q1, TP.HCM', 4, 3, 31000000, '2019-08-01'),
(N'EMP-4002', N'Cao Văn Long', N'long.cv@attendpro.vn', N'0934567802', N'Nam', '1993-09-12', N'200 Trần Quốc Thảo, Q3, TP.HCM', 4, 5, 17000000, '2022-04-15'),
(N'EMP-4003', N'Mai Thị Hương', N'huong.mt@attendpro.vn', N'0934567803', N'Nữ', '1996-11-30', N'300 Cống Quỳnh, Q1, TP.HCM', 4, 5, 15000000, '2024-01-10'),
(N'EMP-4004', N'Tạ Minh Đức', N'duc.tm@attendpro.vn', N'0934567804', N'Nam', '1991-06-18', N'400 Phạm Ngũ Lão, Q1, TP.HCM', 4, 4, 23000000, '2021-03-01'),

-- Phòng Kinh Doanh (4 người)
(N'EMP-5001', N'Vương Văn Thắng', N'thang.vv@attendpro.vn', N'0945678901', N'Nam', '1986-12-01', N'500 Lê Văn Sỹ, Q3, TP.HCM', 5, 3, 33000000, '2018-10-01'),
(N'EMP-5002', N'Lưu Thị Thanh', N'thanh.lt@attendpro.vn', N'0945678902', N'Nữ', '1994-08-22', N'600 Nguyễn Văn Cừ, Q5, TP.HCM', 5, 5, 16000000, '2023-05-01'),
(N'EMP-5003', N'Đinh Quốc Bảo', N'bao.dq@attendpro.vn', N'0945678903', N'Nam', '1992-02-10', N'700 Trần Bình Trọng, Q5, TP.HCM', 5, 5, 19000000, '2022-09-15'),
(N'EMP-5004', N'Châu Thị Yến', N'yen.ct@attendpro.vn', N'0945678904', N'Nữ', '1998-10-05', N'800 Lý Chính Thắng, Q3, TP.HCM', 5, 6, 5000000, '2026-02-15'),

-- Phòng Hành Chính (3 người)
(N'EMP-6001', N'Nguyễn Hữu Phước', N'phuoc.nh@attendpro.vn', N'0956789001', N'Nam', '1990-05-15', N'900 Võ Thị Sáu, Q3, TP.HCM', 6, 3, 27000000, '2020-06-01'),
(N'EMP-6002', N'Trương Thị Mỹ', N'my.tt@attendpro.vn', N'0956789002', N'Nữ', '1997-01-20', N'1000 Phan Đình Phùng, QPN, TP.HCM', 6, 5, 14000000, '2024-04-01'),
(N'EMP-6003', N'Lâm Quốc Việt', N'viet.lq@attendpro.vn', N'0956789003', N'Nam', '1995-07-07', N'1100 Hoàng Sa, Q1, TP.HCM', 6, 5, 15000000, '2023-10-15');
GO

-- Cập nhật ManagerId cho phòng ban
UPDATE Departments SET ManagerId = 1 WHERE DepartmentCode = N'PB-KT';   -- Trần Văn Minh
UPDATE Departments SET ManagerId = 7 WHERE DepartmentCode = N'PB-NS';   -- Nguyễn Thị Lan
UPDATE Departments SET ManagerId = 11 WHERE DepartmentCode = N'PB-MKT'; -- Lý Thị Ngọc
UPDATE Departments SET ManagerId = 15 WHERE DepartmentCode = N'PB-KeTo';-- Dương Thị Kim
UPDATE Departments SET ManagerId = 19 WHERE DepartmentCode = N'PB-KD';  -- Vương Văn Thắng
UPDATE Departments SET ManagerId = 23 WHERE DepartmentCode = N'PB-HC';  -- Nguyễn Hữu Phước
GO

-- ===== 4. Quy định trừ lương khi đi trễ =====
INSERT INTO SalaryDeductions (DeductionName, MinLateMinutes, MaxLateMinutes, DeductionAmount, Description) VALUES
(N'Trễ nhẹ (1-15 phút)', 1, 15, 50000, N'Đi trễ từ 1 đến 15 phút, trừ 50,000 VNĐ'),
(N'Trễ trung bình (16-30 phút)', 16, 30, 100000, N'Đi trễ từ 16 đến 30 phút, trừ 100,000 VNĐ'),
(N'Trễ nặng (31-60 phút)', 31, 60, 200000, N'Đi trễ từ 31 đến 60 phút, trừ 200,000 VNĐ'),
(N'Trễ rất nặng (>60 phút)', 61, 480, 500000, N'Đi trễ hơn 60 phút, trừ 500,000 VNĐ');
GO

-- ===== 5. Dữ liệu chấm công mẫu (Tháng 4-5-6/2026) =====
-- Nhân viên EMP-1002 (Nguyễn Bảo Hân - Phòng Kỹ Thuật - người dùng chính)
INSERT INTO AttendanceRecords (EmployeeId, WorkDate, CheckInTime, CheckOutTime, Status, LateMinutes, EarlyLeaveMinutes, DeductionAmount, Note) VALUES
-- Tháng 4/2026
(2, '2026-04-01', '07:55', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-02', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-03', '08:15', '17:45', N'Đi trễ', 15, 0, 50000, N'Kẹt xe đường Nguyễn Huệ'),
(2, '2026-04-06', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-07', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-08', '08:30', '17:30', N'Đi trễ', 30, 0, 100000, N'Xe hỏng giữa đường'),
(2, '2026-04-09', '07:58', '17:32', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-10', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-13', '07:45', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-14', '08:05', '17:30', N'Đi trễ', 5, 0, 50000, N''),
(2, '2026-04-15', '08:00', '17:15', N'Đi trễ', 0, 15, 50000, N'Ra sớm do có việc gia đình'),
(2, '2026-04-16', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-17', '08:00', '17:45', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-20', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-21', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-22', '09:00', '18:00', N'Đi trễ', 60, 0, 200000, N'Đi khám bệnh buổi sáng'),
(2, '2026-04-23', '07:55', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-24', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-27', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-28', '07:58', '17:32', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-04-29', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),

-- Tháng 5/2026
(2, '2026-05-04', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-05', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-06', '08:10', '17:30', N'Đi trễ', 10, 0, 50000, N''),
(2, '2026-05-07', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-08', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-11', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-12', '08:00', '17:45', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-13', '08:20', '17:30', N'Đi trễ', 20, 0, 100000, N'Mưa lớn kẹt xe'),
(2, '2026-05-14', '07:58', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-15', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-18', '07:55', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-19', '08:00', '17:00', N'Đi trễ', 0, 30, 100000, N'Ra sớm đi khám nha khoa'),
(2, '2026-05-20', '07:45', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-21', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-22', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-25', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-26', '08:05', '17:30', N'Đi trễ', 5, 0, 50000, N''),
(2, '2026-05-27', '08:00', '17:40', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-28', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-05-29', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),

-- Tháng 6/2026
(2, '2026-06-01', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-02', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-03', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-04', '08:45', '17:30', N'Đi trễ', 45, 0, 200000, N'Đi làm CCCD buổi sáng'),
(2, '2026-06-05', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-08', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-09', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-10', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-11', '08:10', '17:30', N'Đi trễ', 10, 0, 50000, N''),
(2, '2026-06-12', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-15', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-16', '08:00', '17:45', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-17', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-18', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-19', '08:00', '17:25', N'Đi trễ', 0, 5, 50000, N'Ra sớm 5 phút'),
(2, '2026-06-22', '07:58', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-23', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-24', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-25', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-26', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-06-29', '08:15', '17:30', N'Đi trễ', 15, 0, 50000, N'Kẹt xe cao tốc'),
(2, '2026-06-30', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),

-- Tháng 7/2026 (chưa chấm ra)
(2, '2026-07-01', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-07-02', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(2, '2026-07-03', '07:58', NULL, N'Đang làm việc', 0, 0, 0, N'Hôm nay');
GO

-- Thêm chấm công cho các nhân viên khác (trích mẫu)
-- Trần Văn Minh (EMP-1001 - Trưởng phòng KT)
INSERT INTO AttendanceRecords (EmployeeId, WorkDate, CheckInTime, CheckOutTime, Status, LateMinutes, EarlyLeaveMinutes, DeductionAmount, Note) VALUES
(1, '2026-06-29', '07:45', '18:00', N'Đúng giờ', 0, 0, 0, N''),
(1, '2026-06-30', '07:50', '17:45', N'Đúng giờ', 0, 0, 0, N''),
(1, '2026-07-01', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(1, '2026-07-02', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(1, '2026-07-03', '07:50', NULL, N'Đang làm việc', 0, 0, 0, N'');
GO

-- Lê Hoàng Nam (EMP-1003)
INSERT INTO AttendanceRecords (EmployeeId, WorkDate, CheckInTime, CheckOutTime, Status, LateMinutes, EarlyLeaveMinutes, DeductionAmount, Note) VALUES
(3, '2026-06-29', '08:20', '17:30', N'Đi trễ', 20, 0, 100000, N''),
(3, '2026-06-30', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(3, '2026-07-01', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(3, '2026-07-02', '08:35', '17:30', N'Đi trễ', 35, 0, 200000, N'Kẹt xe'),
(3, '2026-07-03', '08:10', NULL, N'Đang làm việc', 10, 0, 50000, N'');
GO

-- Phạm Thị Mai (EMP-1004 - Thực tập sinh)
INSERT INTO AttendanceRecords (EmployeeId, WorkDate, CheckInTime, CheckOutTime, Status, LateMinutes, EarlyLeaveMinutes, DeductionAmount, Note) VALUES
(4, '2026-06-29', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(4, '2026-06-30', '08:05', '17:30', N'Đi trễ', 5, 0, 50000, N''),
(4, '2026-07-01', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(4, '2026-07-02', '08:00', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(4, '2026-07-03', '08:00', NULL, N'Đang làm việc', 0, 0, 0, N'');
GO

-- Nguyễn Thị Lan (EMP-2001 - TP Nhân Sự)
INSERT INTO AttendanceRecords (EmployeeId, WorkDate, CheckInTime, CheckOutTime, Status, LateMinutes, EarlyLeaveMinutes, DeductionAmount, Note) VALUES
(7, '2026-06-29', '07:50', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(7, '2026-06-30', '07:55', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(7, '2026-07-01', '08:00', '17:35', N'Đúng giờ', 0, 0, 0, N''),
(7, '2026-07-02', '07:45', '17:30', N'Đúng giờ', 0, 0, 0, N''),
(7, '2026-07-03', '07:55', NULL, N'Đang làm việc', 0, 0, 0, N'');
GO

-- ===== 6. Đơn xin nghỉ phép mẫu =====
INSERT INTO LeaveRequests (EmployeeId, LeaveType, StartDate, EndDate, TotalDays, Reason, Status, ApprovedBy, ApprovedDate) VALUES
(2, N'Nghỉ phép năm', '2026-04-30', '2026-04-30', 1, N'Nghỉ lễ 30/4', N'Đã duyệt', 1, '2026-04-25'),
(2, N'Nghỉ phép năm', '2026-05-01', '2026-05-01', 1, N'Nghỉ lễ 1/5', N'Đã duyệt', 1, '2026-04-25'),
(3, N'Nghỉ ốm', '2026-05-20', '2026-05-21', 2, N'Bị cảm sốt, có giấy bác sĩ', N'Đã duyệt', 1, '2026-05-20'),
(4, N'Nghỉ phép năm', '2026-06-15', '2026-06-16', 2, N'Về quê thăm gia đình', N'Đã duyệt', 1, '2026-06-10'),
(12, N'Nghỉ không lương', '2026-07-10', '2026-07-11', 2, N'Có việc cá nhân', N'Chờ duyệt', NULL, NULL),
(8, N'Nghỉ phép năm', '2026-07-15', '2026-07-18', 4, N'Du lịch gia đình', N'Chờ duyệt', NULL, NULL);
GO

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- SP: Lấy danh sách chấm công của 1 nhân viên
IF OBJECT_ID('sp_GetAttendanceByEmployee', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetAttendanceByEmployee;
GO

CREATE PROCEDURE sp_GetAttendanceByEmployee
    @EmployeeId INT
AS
BEGIN
    SELECT 
        ar.AttendanceId AS id,
        FORMAT(ar.WorkDate, 'dd/MM/yyyy') AS date,
        FORMAT(ar.CheckInTime, 'hh\:mm') AS checkIn,
        ISNULL(FORMAT(ar.CheckOutTime, 'hh\:mm'), '') AS checkOut,
        ar.Status AS status,
        ar.LateMinutes,
        ar.EarlyLeaveMinutes,
        ar.DeductionAmount,
        ar.Note
    FROM AttendanceRecords ar
    WHERE ar.EmployeeId = @EmployeeId
    ORDER BY ar.WorkDate DESC;
END
GO

-- SP: Tính tổng lương bị trừ theo tháng
IF OBJECT_ID('sp_GetMonthlyDeductions', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetMonthlyDeductions;
GO

CREATE PROCEDURE sp_GetMonthlyDeductions
    @EmployeeId INT,
    @Month INT,
    @Year INT
AS
BEGIN
    SELECT 
        e.EmployeeCode,
        e.FullName,
        d.DepartmentName,
        p.PositionName,
        e.Salary AS BaseSalary,
        COUNT(ar.AttendanceId) AS TotalWorkDays,
        SUM(CASE WHEN ar.Status = N'Đúng giờ' THEN 1 ELSE 0 END) AS OnTimeDays,
        SUM(CASE WHEN ar.Status = N'Đi trễ' THEN 1 ELSE 0 END) AS LateDays,
        SUM(ar.LateMinutes) AS TotalLateMinutes,
        SUM(ar.DeductionAmount) AS TotalDeduction,
        e.Salary - SUM(ar.DeductionAmount) AS ActualSalary
    FROM Employees e
    INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
    INNER JOIN Positions p ON e.PositionId = p.PositionId
    LEFT JOIN AttendanceRecords ar ON e.EmployeeId = ar.EmployeeId 
        AND MONTH(ar.WorkDate) = @Month 
        AND YEAR(ar.WorkDate) = @Year
    WHERE e.EmployeeId = @EmployeeId
    GROUP BY e.EmployeeCode, e.FullName, d.DepartmentName, p.PositionName, e.Salary;
END
GO

-- SP: Tính tiền trừ lương dựa trên số phút trễ
IF OBJECT_ID('fn_GetDeductionAmount', 'FN') IS NOT NULL
    DROP FUNCTION fn_GetDeductionAmount;
GO

CREATE FUNCTION fn_GetDeductionAmount(@LateMinutes INT)
RETURNS DECIMAL(18,0)
AS
BEGIN
    DECLARE @Amount DECIMAL(18,0) = 0;
    
    SELECT TOP 1 @Amount = DeductionAmount 
    FROM SalaryDeductions 
    WHERE @LateMinutes BETWEEN MinLateMinutes AND MaxLateMinutes
        AND IsActive = 1;
    
    RETURN @Amount;
END
GO

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Tổng hợp chấm công nhân viên
IF OBJECT_ID('vw_EmployeeAttendanceSummary', 'V') IS NOT NULL
    DROP VIEW vw_EmployeeAttendanceSummary;
GO

CREATE VIEW vw_EmployeeAttendanceSummary AS
SELECT 
    e.EmployeeId,
    e.EmployeeCode,
    e.FullName,
    d.DepartmentName,
    p.PositionName,
    e.Salary,
    COUNT(ar.AttendanceId) AS TotalAttendance,
    SUM(CASE WHEN ar.Status = N'Đúng giờ' THEN 1 ELSE 0 END) AS OnTimeDays,
    SUM(CASE WHEN ar.Status = N'Đi trễ' THEN 1 ELSE 0 END) AS LateDays,
    SUM(ISNULL(ar.DeductionAmount, 0)) AS TotalDeduction
FROM Employees e
INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
INNER JOIN Positions p ON e.PositionId = p.PositionId
LEFT JOIN AttendanceRecords ar ON e.EmployeeId = ar.EmployeeId
WHERE e.IsActive = 1
GROUP BY e.EmployeeId, e.EmployeeCode, e.FullName, d.DepartmentName, p.PositionName, e.Salary;
GO

-- =====================================================
-- QUERIES MẪU ĐỂ KIỂM TRA DỮ LIỆU
-- =====================================================

-- Xem tất cả nhân viên kèm phòng ban và chức vụ
-- SELECT e.EmployeeCode, e.FullName, d.DepartmentName, p.PositionName, FORMAT(e.Salary, 'N0') AS Salary
-- FROM Employees e
-- INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
-- INNER JOIN Positions p ON e.PositionId = p.PositionId
-- ORDER BY d.DepartmentName, p.Level DESC;

-- Xem chấm công của Nguyễn Bảo Hân
-- EXEC sp_GetAttendanceByEmployee @EmployeeId = 2;

-- Xem tổng trừ lương tháng 6/2026
-- EXEC sp_GetMonthlyDeductions @EmployeeId = 2, @Month = 6, @Year = 2026;

-- Xem tổng hợp chấm công
-- SELECT * FROM vw_EmployeeAttendanceSummary ORDER BY TotalDeduction DESC;


