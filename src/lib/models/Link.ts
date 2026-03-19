import mongoose, { Schema, model, models } from "mongoose";

const LinkSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
    },

    //  FIXED FOR CLERK
    userId: {
      type: String,
      default: null,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    clickHistory: [
      {
        date: {
          type: String, // fine for now
          required: true,
        },
        clicks: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true } // 🔥 better than manual createdAt
);

const Link = models.Link || model("Link", LinkSchema);

export default Link;