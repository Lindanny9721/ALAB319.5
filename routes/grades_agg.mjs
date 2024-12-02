import express from "express";
import mongoose, { mongo } from "mongoose";
import Grade from "../models/Grades.mjs";

const router = express.Router();

/**
 * It is not best practice to seperate these routes
 * like we have done here. This file was created
 * specifically for educational purposes, to contain
 * all aggregation routes in one place.
 */

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizes: 30%
 * - Homework: 20%
 */

// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {

  let result = await Grade
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ])

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});
router.get("/stats", async (req, res) => {

  let result = await Grade
    .aggregate([
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$learner_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
      {
        $match: {
          avg: { $gte: 70 },
        },
      },
    ])
  const totalLearners = (await Grade.distinct("learner_id")).length;
  const learnersAbove70 = result.length;
  const percentageAbove70 = (learnersAbove70 / totalLearners) * 100;
  if (!result) res.send("Not found").status(404);
  else res.send({totalLearners, learnersAbove70, percentageAbove70}).status(200)
});
router.get("/stats/:id", async (req, res) => {

  let result = await Grade
    .aggregate([
      {
        $match: { class_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$learner_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
      {
        $match: {
          avg: { $gte: 70 },
        },
      },
    ])
  const totalLearnersInClass = await Grade
    .aggregate([
      {
        $match: { class_id: Number(req.params.id) },
      },
      {
        $group: {
          _id: "$learner_id",
        },
      },
      {
        $count: "learnerInClass",
      },
    ])
  const totalLearners = totalLearnersInClass.length > 0 ? totalLearnersInClass[0].learnerInClass : 0;
  const learnersAbove70 = result.length;
  const percentageAbove70 = (learnersAbove70 / totalLearners) * 100;
  if (!result) res.send("Not found").status(404);
  else res.send({totalLearners, learnersAbove70, percentageAbove70}).status(200)
});
Grade.createIndexes();
const newGradeSchema = new mongoose.Schema({
  class_id: {
    type: Number,
    required: true,
    min: 0,
    max: 300
  },
  learner_id: {
    type: Number,
    required: true,
    min: 0
  }
})
//In case you wanted to test this newSchema
// const newGrade = mongoose.model('newGrade', newGradeSchema);
// async function testnewSchema() {
//   const test1 = new newGrade({
//     class_id: 10,
//     learner_id: 20
//   })
//   await test1.save();
//   const test2 = new newGrade({
//     class_id: 301,
//     learner_id: 2
//   })
//   await test2.save();
// }
// testnewSchema();
export default router;