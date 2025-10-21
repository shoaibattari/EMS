import ExcelJS from "exceljs";
import studentModel from "../../models/studentModel.js";

export const registerStudent = async (req, res) => {
  try {
    const {
      campus,
      course,
      sectionTime,
      fullName,
      fatherName,
      contact,
      email,
      cnic,
      gender,
      dob,
      qualification,
      address,
      city,
      institute,
      communityCardNumber,
      cast,
      community,
    } = req.body;
    console.log(req.body, "reqqqq");

    // Validation
    if (
      !campus ||
      !course ||
      !sectionTime ||
      !fullName ||
      !fatherName ||
      !contact ||
      !email ||
      !cnic ||
      !gender ||
      !dob ||
      !qualification ||
      !address ||
      !city ||
      !institute ||
      !communityCardNumber ||
      !cast ||
      !community
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields", status: false });
    }

    const newStudent = await studentModel.create({
      campus,
      course,
      sectionTime,
      fullName,
      fatherName,
      contact,
      email,
      cnic,
      gender,
      dob,
      qualification,
      address,
      city,
      institute,
      communityCardNumber,
      cast,
      community,
      profileImage: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      message: "Student registered successfully",
      status: true,
      data: newStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await studentModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "All students fetched successfully",
      status: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const exportStudentData = async (req, res) => {
  try {
    const students = await studentModel.find();

    if (students.length === 0) {
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
      { header: "community", key: "community", width: 20 },
      { header: "cast", key: "cast", width: 20 },
      { header: "Community Card Number", key: "communityCardNumber", width: 20 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Qualification", key: "qualification", width: 20 },
      { header: "City", key: "city", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    students.forEach((s) => {
      worksheet.addRow({
        ...s._doc,
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
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};
