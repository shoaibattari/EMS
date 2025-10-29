import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: { type: String, unique: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    section: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one section is required",
      },
    },
    fees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Coming Soon", "Admission Open", "Admission Closed"],
      required: false,
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
    batch: { type: String, required: true },
    courseCampus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate Course ID like "COURSE-0001"
courseSchema.pre("save", async function (next) {
  if (!this.courseId) {
    const count = await mongoose.model("Course").countDocuments();
    this.courseId = `COURSE-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Course", courseSchema);
