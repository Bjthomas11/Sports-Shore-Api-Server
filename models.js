"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  team: [String],
  user: { type: String, required: true }
});

teamSchema.methods.serialize = function() {
  return {
    id: this._id,
    team: this.team,
    user: this.user
  };
};

const Teams = mongoose.model("Teams", teamSchema);

module.exports = { Teams };
