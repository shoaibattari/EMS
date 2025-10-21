import mongoose from "mongoose";
const { Schema } = mongoose;

const volunteerSchema = new Schema({
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  khundi: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  cnic: { type: String, required: true },
  omjCard: { type: String },
  education: { type: String, required: true },
  institution: { type: String, required: true },
  field: { type: String },
  volunteerArea: { type: String, required: true },
  experience: { type: String, required: true },
  timeCommitment: { type: String, required: true },
  volunteerId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate VOL-0001 style IDs
volunteerSchema.pre("save", async function (next) {
  if (!this.volunteerId) {
    const count = await mongoose.model("volunteer").countDocuments();
    this.volunteerId = `VOL-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const volunteer = mongoose.model("volunteer", volunteerSchema);
export default volunteer;
