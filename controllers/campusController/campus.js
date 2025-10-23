import ExcelJS from "exceljs";
import campusModel from "../../models/campusModel.js"; // make sure path is correct

// ✅ Register a new campus
export const registerCampus = async (req, res) => {
  try {
    const { name, address, contact } = req.body;

    // Validation
    if (!name || !address || !contact) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields", status: false });
    }

    const newCampus = await campusModel.create({
      name,
      address,
      contact,
    });

    res.status(201).json({
      message: "Campus registered successfully",
      status: true,
      data: newCampus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Get all campuses
export const getAllCampuses = async (req, res) => {
  try {
    const campuses = await campusModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All campuses fetched successfully",
      status: true,
      data: campuses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Export campuses to Excel
export const exportCampusData = async (req, res) => {
  try {
    const campuses = await campusModel.find();

    if (campuses.length === 0) {
      return res.status(200).json({
        message: "No campus data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Campuses");

    worksheet.columns = [
      { header: "Campus ID", key: "campusId", width: 20 },
      { header: "Campus Name", key: "name", width: 35 },
      { header: "Address", key: "address", width: 40 },
      { header: "Contact", key: "contact", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    campuses.forEach((c) => {
      worksheet.addRow({
        ...c._doc,
        createdAt: c.createdAt.toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=campuses.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};
