import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    venue: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Coming Soon", "Registration Open", "Registration Closed"],
      required: "Coming Soon",
    },
    category: { 
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Both"],
      default: "Both",
    },

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
