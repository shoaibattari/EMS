import ExcelJS from "exceljs";
import mongoose from "mongoose";
import studentModel from "../../models/studentModel.js";

// Register Student
export const registerStudent = async (req, res) => {
  try {
    const {
      campus,
      course,
      sectionTime,
      fullName,
      fatherName,
      contact,
    } = req.body;

    // Basic validation
    if (
      !campus ||
      !course ||
      !sectionTime ||
      !fullName ||
      !fatherName ||
      !contact
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
        status: false,
      });
    }

    const newStudent = await studentModel.create({
      ...req.body,
      profileImage: req.files?.profileImage
        ? {
            url: req.files.profileImage[0].path,
            publicId: req.files.profileImage[0].filename,
          }
        : undefined,

      paymentSlip: req.files?.paymentSlip
        ? {
            url: req.files.paymentSlip[0].path,
            publicId: req.files.paymentSlip[0].filename,
          }
        : undefined,
    });

    res.status(201).json({
      message: "Student registered successfully",
      status: true,
      data: newStudent,
    });
  } catch (error) {
    console.error("registerStudent Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Get All Students with Search & Pagination
export const getAllStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    let query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query = {
        $or: [
          { studentId: regex },
          { fullName: regex },
          { fatherName: regex },
          { email: regex },
          { contact: regex },
          { cnic: regex },
          { community: regex },
          { cast: regex },
        ],
      };
    }

    const total = await studentModel.countDocuments(query);

    const students = await studentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      message: "Students fetched successfully",
      status: true,
      data: students,
      pagination: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("getAllStudents Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Export Students to Excel
export const exportStudentData = async (req, res) => {
  try {
    const students = await studentModel.find();

    if (!students.length) {
      return res.status(200).json({
        message: "No student data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "Student ID", key: "studentId", width: 25 },
      { header: "Full Name", key: "fullName", width: 45 },
      { header: "Father Name", key: "fatherName", width: 25 },
      { header: "Campus", key: "campus", width: 20 },
      { header: "Course", key: "course", width: 25 },
      { header: "Section Time", key: "sectionTime", width: 25 },
      { header: "Contact", key: "contact", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "CNIC", key: "cnic", width: 20 },
      { header: "Institute", key: "institute", width: 20 },
      { header: "Community", key: "community", width: 20 },
      { header: "Cast", key: "cast", width: 20 },
      {
        header: "Community Card Number",
        key: "communityCardNumber",
        width: 20,
      },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Qualification", key: "qualification", width: 20 },
      { header: "City", key: "city", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Is Paid", key: "isPaid", width: 10 },
      { header: "Payment Date", key: "paymentDate", width: 25 },
      { header: "Payment Updated By", key: "paymentUpdatedBy", width: 25 },
      { header: "Attendance", key: "isAttend", width: 10 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    students.forEach((s) => {
      worksheet.addRow({
        ...s._doc,
        paymentDate: s.paymentDate ? s.paymentDate.toLocaleString() : "",
        paymentUpdatedBy: s.paymentUpdatedBy?.name || "",
        isAttend: s.isAttend ? "Present" : "Absent",
        createdAt: s.createdAt.toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportStudentData Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Update Payment Status
export const statusPaymentUpdate = async (req, res) => {
  try {
    const { studentId } = req.params;
    let { isPaid } = req.body;

    const isPaidBoolean = isPaid === true || isPaid === "true";
    const updateData = { isPaid: isPaidBoolean };

    if (isPaidBoolean) {
      updateData.paymentDate = new Date();
      updateData.paymentUpdatedBy = req.user?.id
        ? new mongoose.Types.ObjectId(req.user.id)
        : null;
    } else {
      updateData.paymentDate = null;
      updateData.paymentUpdatedBy = null;
    }

    const updatedStudent = await studentModel
      .findByIdAndUpdate(studentId, updateData, { new: true })
      .populate("paymentUpdatedBy", "name email");

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      status: true,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("statusPaymentUpdate Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { isAttend } = req.body;

    if (typeof isAttend !== "boolean") {
      return res.status(400).json({
        message: "isAttend must be a boolean value",
        status: false,
      });
    }

    const updatedStudent = await studentModel.findByIdAndUpdate(
      studentId,
      { isAttend },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      status: true,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("markAttendance Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Get Student by Query (CNIC, Contact, ID)
export const getStudentByQuery = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Please provide CNIC, Mobile Number, or ID",
        status: false,
      });
    }

    const student = await studentModel.find({
      $or: [{ contact: query }, { cnic: query }, { studentId: query }],
    });

    if (!student.length) {
      return res.status(404).json({
        message:
          "Record not found. Please check your details or Register again.",
        status: false,
      });
    }

    res.status(200).json({
      message: "Student record found",
      status: true,
      data: student,
    });
  } catch (error) {
    console.error("getStudentByQuery Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Get Student Stats
export const getStudentStats = async (req, res) => {
  try {
    const students = await studentModel.find();

    if (!students.length) {
      return res.status(200).json({
        status: true,
        message: "No students found",
        data: {},
      });
    }

    const stats = {
      total: students.length,
      gender: { male: 0, female: 0 },
      paid: { total: 0, male: 0, female: 0 },
      attendance: { total: 0, male: 0, female: 0 },
    };

    students.forEach((s) => {
      if (s.gender === "Male") stats.gender.male++;
      else if (s.gender === "Female") stats.gender.female++;

      if (s.isPaid) {
        stats.paid.total++;
        if (s.gender === "Male") stats.paid.male++;
        else if (s.gender === "Female") stats.paid.female++;
      }

      if (s.isAttend) {
        stats.attendance.total++;
        if (s.gender === "Male") stats.attendance.male++;
        else if (s.gender === "Female") stats.attendance.female++;
      }
    });

    res.status(200).json({
      status: true,
      message: "Student stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("getStudentStats Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
