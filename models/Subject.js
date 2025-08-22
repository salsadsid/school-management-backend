import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    components: [
      {
        name: {
          type: String,
          enum: [
            "mcq",
            "written",
            "practical",
            "classTest",
            "groupWork",
            "remarks",
          ],
        },
        maxMarks: { type: Number, required: true },
        isOptional: { type: Boolean, default: false }, // e.g., practical may be optional for some subjects
      },
    ],
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
