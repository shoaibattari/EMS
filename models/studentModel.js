import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    campus: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sectionTime: { type: String },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String },
    community: { type: String },
    cast: { type: String },
    communityCardNumber: { type: String },
    cnic: { type: String },
    gender: { type: String },
    dob: { type: String },
    qualification: { type: String },
    institute: { type: String },
    address: { type: String },
    city: { type: String },
    profileImage: { type: String },
    paymentSlip: { type: String },
    studentId: { type: String, unique: true },
    isPaid: { type: Boolean, default: false },
    isAttend: { type: Boolean, default: false },
    paymentDate: { type: Date },
    paymentUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
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
