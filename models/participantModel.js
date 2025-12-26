import mongoose from "mongoose";
const { Schema } = mongoose;

const participantSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    category: { type: String },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    community: { type: String, required: true },
    cast: { type: String, required: true },
    communityCardNumber: { type: String, required: true },
    cnic: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    qualification: { type: String, required: true },
    institute: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    profileImage: { type: String },
    participantId: { type: String, unique: true },
    isPaid: { type: Boolean, default: false },
    isAttend: { type: Boolean, default: false },
    paymentDate: { type: Date },
    paymentUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

participantSchema.pre("save", async function (next) {
  if (!this.participantId) {
    const count = await mongoose.model("Participant").countDocuments();
    this.participantId = `OMJ-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Participant", participantSchema);
