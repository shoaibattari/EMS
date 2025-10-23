import ExcelJS from "exceljs";
import eventModel from "../../models/eventModel.js";

// ✅ Register new event
export const registerEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      duration,
      venue,
      description,
      male,
      female,
      category,
      eventCampus,
    } = req.body;

    // Validation
    if (
      !name ||
      !date ||
      !duration ||
      !venue ||
      !description ||
      !category ||
      male === undefined ||
      female === undefined ||
      !eventCampus
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields", status: false });
    }

    const newEvent = await eventModel.create({
      name,
      date,
      duration,
      venue,
      description,
      category,
      male,
      female,
      eventCampus,
    });

    res.status(201).json({
      message: "Event registered successfully",
      status: true,
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Get all events (with campus details)
export const getAllEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .populate("eventCampus", "campusId name address contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All events fetched successfully",
      status: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

// ✅ Export events to Excel
export const exportEventData = async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .populate("eventCampus", "campusId name");

    if (events.length === 0) {
      return res.status(200).json({
        message: "No event data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Events");

    worksheet.columns = [
      { header: "Event ID", key: "eventId", width: 20 },
      { header: "Event Name", key: "name", width: 35 },
      { header: "Date", key: "date", width: 20 },
      { header: "Duration", key: "duration", width: 20 },
      { header: "Venue", key: "venue", width: 25 },
      { header: "Description", key: "description", width: 40 },
      { header: "Category", key: "category", width: 20 },
      { header: "Campus", key: "campusName", width: 25 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    events.forEach((e) => {
      worksheet.addRow({
        eventId: e.eventId,
        name: e.name,
        date: e.date,
        duration: e.duration,
        venue: e.venue,
        description: e.description,
        category: e.category,
        campusName: e.eventCampus?.name || "N/A",
        createdAt: e.createdAt.toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=events.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
