import ExcelJS from "exceljs";
import participantModel from "../../models/participantModel.js";

export const registerParticipant = async (req, res) => {
  try {
    const {
      event,
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
    const participants = await participantModel.find().sort({ createdAt: -1 });
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
    const participants = await participantModel.find();

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
      { header: "Full Name", key: "fullName", width: 45 },
      { header: "Father Name", key: "fatherName", width: 25 },
      { header: "Event", key: "event", width: 25 },
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
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    participants.forEach((s) => {
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
