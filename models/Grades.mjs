import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
    learner_id: { type: Number, required: true },
    class_id: { type: Number, required: true },
    scores: { type: Array, required: true }
});
gradeSchema.index({ class_id: 1});
gradeSchema.index({ learner_id: 1});
gradeSchema.index({ learner_id: 1, class_id: 1});
const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;