const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    CompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    actions: {
      view: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      default: "active",
    },
    permissions: [permissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
