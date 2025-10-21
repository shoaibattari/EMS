import volunteerModel from "../../models/volunteerModel.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// Add Volunteer
export const createVolunteer = async (req, res) => {
  console.log("🚀 ~ createVolunteer ~ req:", req.body);
  try {
    const {
      fullName,
      fatherName,
      khundi,
      gender,
      dob,
      contact,
      email,
      address,
      cnic,
      omjCard,
      education,
      institution,
      field,
      volunteerArea,
      experience,
      timeCommitment,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !fatherName ||
      !khundi ||
      !gender ||
      !dob ||
      !contact ||
      !email ||
      !address ||
      !cnic ||
      !education ||
      !institution ||
      !volunteerArea ||
      !experience ||
      !timeCommitment
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
        status: false,
        data: null,
      });
    }

    // Create a new volunteer record
    const newVolunteer = await volunteerModel.create({
      fullName,
      fatherName,
      khundi,
      gender,
      dob,
      contact,
      email,
      address,
      cnic,
      omjCard,
      education,
      institution,
      field,
      volunteerArea,
      experience,
      timeCommitment,
    });

    res.status(200).json({
      message: "Volunteer registered successfully",
      status: true,
      data: newVolunteer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
      data: null,
    });
  }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await volunteerModel.find().sort({ createdAt: 1 });

    if (volunteers.length === 0) {
      return res.status(200).json({
        message: "No data found",
        status: true,
      });
    }

    res.status(200).json({
      message: "All volunteers fetched successfully",
      status: true,
      data: volunteers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const exportVolunteers = async (req, res) => {
  try {
    const volunteers = await volunteerModel.find();

    if (volunteers.length === 0) {
      return res.status(200).json({
        message: "No data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Volunteers");

    // 🧾 Add Header Row
    worksheet.columns = [
      { header: "Volunteer ID", key: "volunteerId", width: 20 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Father Name", key: "fatherName", width: 25 },
      { header: "Khundi", key: "khundi", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Contact", key: "contact", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Address", key: "address", width: 30 },
      { header: "CNIC", key: "cnic", width: 20 },
      { header: "OMJ Card", key: "omjCard", width: 15 },
      { header: "Education", key: "education", width: 20 },
      { header: "Institution", key: "institution", width: 25 },
      { header: "Field", key: "field", width: 20 },
      { header: "Volunteer Area", key: "volunteerArea", width: 20 },
      { header: "Experience", key: "experience", width: 20 },
      { header: "Time Commitment", key: "timeCommitment", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    // ✨ Add Rows
    volunteers.forEach((v) => {
      worksheet.addRow({
        ...v._doc,
        createdAt: v.createdAt.toLocaleString(),
      });
    });

    // 📦 Set Header Styles
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // 📨 Send Excel file to frontend
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=volunteers.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const generateVolunteerCard = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await volunteerModel.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
        status: false,
      });
    }

    // Create PDF
    const doc = new PDFDocument({ size: "A4", layout: "portrait" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${volunteer.volunteerId || volunteer._id}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // 🧾 Volunteer Card Layout
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f0f4f8");

    doc
      .fontSize(18)
      .fillColor("#003366")
      .text("Volunteer ID Card", { align: "center" });

    doc.moveDown(1);

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Volunteer ID: ${volunteer.volunteerId || volunteer._id}`)
      .text(`Name: ${volunteer.fullName}`)
      .text(`Father Name: ${volunteer.fatherName}`)
      .text(`Gender: ${volunteer.gender}`)
      .text(`Contact: ${volunteer.contact}`)
      .text(`Email: ${volunteer.email}`)
      .text(`Area: ${volunteer.address}`)
      .text(`Volunteer Area: ${volunteer.volunteerArea}`);

    // Add footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("The Okhai Memon Jamat – Social Welfare Committee", {
        align: "center",
      });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};
