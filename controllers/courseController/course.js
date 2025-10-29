import ExcelJS from "exceljs";
import courseModel from "../../models/courseModel.js";

// ✅ Register new course
export const registerCourse = async (req, res) => {
  try {
    const {
      name,
      duration,
      gender,
      batch,
      status,
      courseCampus,
      fees,
      section,
      category,
    } = req.body;

    // Validation
    if (
      !name ||
      !duration ||
      !gender ||
      !status ||
      !batch ||
      !courseCampus ||
      !section
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields", status: false });
    }

    let formattedSection = [];
    if (Array.isArray(section)) {
      formattedSection = section.filter((s) => s.trim() !== "");
    } else if (typeof section === "string") {
      formattedSection = section.split(",").map((s) => s.trim());
    }

    if (formattedSection.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one section is required", status: false });
    }

    let formattedCategory = [];
    if (category) {
      if (Array.isArray(category)) formattedCategory = category;
      else if (typeof category === "string") {
        formattedCategory = category.split(",").map((c) => c.trim());
      }
    }
    const newCourse = await courseModel.create({
      name,
      duration,
      gender,
      batch,
      status,
      courseCampus,
      fees,
      section: formattedSection,
      category: formattedCategory,
    });

    res.status(201).json({
      message: "Course registered successfully",
      status: true,
      data: newCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Get all courses (with campus details)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel
      .find()
      .populate("courseCampus", "campusId name address contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All courses fetched successfully",
      status: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Export courses to Excel
export const exportCourseData = async (req, res) => {
  try {
    const courses = await courseModel
      .find()
      .populate("courseCampus", "campusId name");

    if (courses.length === 0) {
      return res.status(200).json({
        message: "No course data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Courses");

    worksheet.columns = [
      { header: "Course ID", key: "courseId", width: 20 },
      { header: "Course Name", key: "name", width: 35 },
      { header: "Duration", key: "duration", width: 20 },
      { header: "Section", key: "section", width: 20 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Batch", key: "batch", width: 15 },
      { header: "Campus", key: "campusName", width: 30 },
      { header: "Category", key: "category", width: 30 },
      { header: "Fees", key: "fees", width: 15 },
      { header: "Status", key: "status", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    courses.forEach((c) => {
      worksheet.addRow({
        courseId: c.courseId,
        name: c.name,
        duration: c.duration,
        gender: c.gender,
        batch: c.batch,
        ection: Array.isArray(c.section) ? c.section.join(" | ") : c.section,
        status: c.status,
        campusName: c.courseCampus?.name || "N/A",
        category: c.category?.join(", ") || "-",
        fees: c.fees && c.fees > 0 ? c.fees : "Free",
        createdAt: c.createdAt.toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=courses.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
