import ExcelJS from "exceljs";
import mongoose from "mongoose";
import participantModel from "../../models/participantModel.js";

// Register Participant
export const registerParticipant = async (req, res) => {
  try {
    const { event, fullName, fatherName, contact, gender, dob } = req.body;

    // Basic validation
    if (!event || !fullName || !fatherName || !contact || !gender || !dob) {
      return res.status(400).json({
        message: "Please fill all required fields",
        status: false,
      });
    }

    const newParticipant = await participantModel.create({
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
      message: "Participant registered successfully",
      status: true,
      data: newParticipant,
    });
  } catch (error) {
    console.error("registerParticipant Error:", error);
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

// Get All Participants with Search & Pagination
export const getAllParticipant = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { participantId: searchRegex },
          { fullName: searchRegex },
          { fatherName: searchRegex },
          { email: searchRegex },
          { contact: searchRegex },
          { cnic: searchRegex },
          { community: searchRegex },
          { cast: searchRegex },
        ],
      };
    }

    const total = await participantModel.countDocuments(query);

    const participants = await participantModel
      .find(query)
      .populate("event", "name date venue")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      message: "Participants fetched successfully",
      status: true,
      data: participants,
      pagination: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("getAllParticipant Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Export Participants to Excel
export const exportParticipantData = async (req, res) => {
  try {
    const participants = await participantModel
      .find()
      .populate("event", "title date")
      .populate("paymentUpdatedBy", "name");

    if (!participants.length) {
      return res.status(200).json({
        message: "No participants data found",
        status: false,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participants");

    worksheet.columns = [
      { header: "Participant ID", key: "participantId", width: 25 },
      { header: "Event", key: "event", width: 25 },
      { header: "Category", key: "category", width: 25 },
      { header: "Full Name", key: "fullName", width: 45 },
      { header: "Father Name", key: "fatherName", width: 25 },
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
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    participants.forEach((p) => {
      worksheet.addRow({
        ...p._doc,
        event: p.event?.title || "",
        paymentDate: p.paymentDate ? p.paymentDate.toLocaleString() : "",
        paymentUpdatedBy: p.paymentUpdatedBy?.name || "",
        createdAt: p.createdAt.toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=participants.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportParticipantData Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Update Payment Status
export const statusPaymentUpdate = async (req, res) => {
  try {
    const { participantId } = req.params;
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

    const updatedParticipant = await participantModel
      .findByIdAndUpdate(participantId, updateData, { new: true })
      .populate("paymentUpdatedBy", "name email userRole");

    if (!updatedParticipant) {
      return res.status(404).json({
        message: "Participant not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      status: true,
      data: updatedParticipant,
    });
  } catch (error) {
    console.error("statusPaymentUpdate Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { isAttend } = req.body;

    if (typeof isAttend !== "boolean") {
      return res.status(400).json({
        message: "isAttend must be a boolean value",
        status: false,
      });
    }

    const updatedParticipant = await participantModel.findByIdAndUpdate(
      participantId,
      { isAttend },
      { new: true }
    );

    if (!updatedParticipant) {
      return res.status(404).json({
        message: "Participant not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      status: true,
      data: updatedParticipant,
    });
  } catch (error) {
    console.error("markAttendance Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Get Participant by Query (CNIC, Contact, ID)
export const getParticipantByQuery = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Please provide CNIC, Mobile Number, or ID",
        status: false,
      });
    }

    const participant = await participantModel
      .find({
        $or: [{ contact: query }, { cnic: query }, { participantId: query }],
      })
      .populate("event", "name date venue");

    if (!participant.length) {
      return res.status(404).json({
        message:
          "Record not found. Please check your details or Register again.",
        status: false,
      });
    }

    res.status(200).json({
      message: "Registration found",
      status: true,
      data: participant,
    });
  } catch (error) {
    console.error("getParticipantByQuery Error:", error);
    res.status(500).json({ message: error.message, status: false });
  }
};

// Get Participant Statistics
export const getParticipantStats = async (req, res) => {
  try {
    const participants = await participantModel.find();

    if (!participants.length) {
      return res.status(200).json({
        status: true,
        message: "No participants found",
        data: {},
      });
    }

    const stats = {
      total: participants.length,
      gender: { male: 0, female: 0 },
      paid: { total: 0, male: 0, female: 0 },
      attendance: { total: 0, male: 0, female: 0 },
    };

    participants.forEach((p) => {
      if (p.gender === "Male") stats.gender.male++;
      else if (p.gender === "Female") stats.gender.female++;

      if (p.isPaid) {
        stats.paid.total++;
        if (p.gender === "Male") stats.paid.male++;
        else if (p.gender === "Female") stats.paid.female++;
      }

      if (p.isAttend) {
        stats.attendance.total++;
        if (p.gender === "Male") stats.attendance.male++;
        else if (p.gender === "Female") stats.attendance.female++;
      }
    });

    res.status(200).json({
      status: true,
      message: "Participant stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("getParticipantStats Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
