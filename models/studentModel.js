import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    campus: { type: String, required: true },
    course: { type: String, required: true },
    favTime: { type: String, required: true },
    fullName: { type: String, required: true },
    guardianName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    cnic: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    qualification: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    profileImage: { type: String },
    studentId: { type: String, unique: true },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model("Student").countDocuments();
    this.studentId = `STD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Student", studentSchema);
