import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: { type: String, unique: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    category: { type: String, required: true },
    male: { type: Boolean, default: false },
    female: { type: Boolean, default: false },
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
