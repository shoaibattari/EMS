import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    venue: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    male: { type: Boolean, default: false },
    female: { type: Boolean, default: false },
    eventCampus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate Event ID like "EVT-0001"
eventSchema.pre("save", async function (next) {
  if (!this.eventId) {
    const count = await mongoose.model("Event").countDocuments();
    this.eventId = `EVT-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Event", eventSchema);
