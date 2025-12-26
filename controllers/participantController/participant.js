import ExcelJS from "exceljs";
import User from "../../models/userModel.js";
import participantModel from "../../models/participantModel.js";

import mongoose from "mongoose";

export const registerParticipant = async (req, res) => {
  try {
    const {
      event,
      category,
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

    // Validation
    if (
      !event ||
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

    const newParticipant = await participantModel.create({
      event,
      category,
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
      message: "Participant registered successfully",
      status: true,
      data: newParticipant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const getAllParticipant = async (req, res) => {
  try {
    const participants = await participantModel
      .find()
      .populate("event", "name date venue")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "All participant fetched successfully",
      status: true,
      data: participants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const exportParticipantData = async (req, res) => {
  try {
    const participants = await participantModel
      .find()
      .populate("event", "title date")
      .populate("paymentUpdatedBy", "name");

    if (participants.length === 0) {
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
      { header: "community", key: "community", width: 20 },
      { header: "cast", key: "cast", width: 20 },
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
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    participants.forEach((s) => {
      worksheet.addRow({
        ...s._doc,
        paymentDate: p.paymentDate ? p.paymentDate.toLocaleString() : "",
        paymentUpdatedBy: p.paymentUpdatedBy?.name || "",
        createdAt: s.createdAt.toLocaleString(),
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
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const statusPaymentUpdate = async (req, res) => {
  try {
    const { participantId } = req.params;
    let { isPaid } = req.body;

    // Handle string "true"/"false" from frontend
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

export const markAttendance = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { isAttend } = req.body; // true/false from frontend

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
    console.error(error);
    res.status(500).json({ message: error.message, status: false });
  }
};
