import ExcelJS from "exceljs";
import courseModel from "../../models/courseModel.js";

// ✅ Register new course
export const registerCourse = async (req, res) => {
  try {
    const { name, duration, category, male, female, batch, courseCampus } =
      req.body;

    // Validation
    if (
      !name ||
      !duration ||
      !category ||
      male === undefined ||
      female === undefined ||
      !batch ||
      !courseCampus
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields", status: false });
    }

    const newCourse = await courseModel.create({
      name,
      duration,
      category,
      male,
      female,
      batch,
      courseCampus,
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
      { header: "Category", key: "category", width: 20 },
      { header: "Male", key: "male", width: 10 },
      { header: "Female", key: "female", width: 10 },
      { header: "Batch", key: "batch", width: 15 },
      { header: "Campus", key: "campusName", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    courses.forEach((c) => {
      worksheet.addRow({
        courseId: c.courseId,
        name: c.name,
        duration: c.duration,
        category: c.category,
        male: c.male,
        female: c.female,
        batch: c.batch,
        campusName: c.courseCampus?.name || "N/A",
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
