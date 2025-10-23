import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    campusId: { type: String, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-generate campusId like "CAMP-0001", "CAMP-0002", etc.
campusSchema.pre("save", async function (next) {
  if (!this.campusId) {
    const count = await mongoose.model("Campus").countDocuments();
    this.campusId = `CAMP-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Campus", campusSchema);
