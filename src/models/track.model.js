const mongoose = require("mongoose");

const generatePublicId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TRK-${timestamp}-${rand}`;
};

const trackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Unique id visible to user (used in list & search)
    publicId: {
      type: String,
      unique: true,
      index: true,
    },

    // Basic details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    upcEan: {
      type: String,
      trim: true,
    },

    primaryArtist: {
      type: String,
      required: true,
      trim: true,
    },
    featuring: {
      type: String,
      trim: true,
    },

    lyricist: {
      type: String,
      required: true,
      trim: true,
    },
    composer: {
      type: String,
      required: true,
      trim: true,
    },
    arranger: {
      type: String,
      trim: true,
    },
    producer: {
      type: String,
      trim: true,
    },

    genre: {
      type: String,
      required: true,
      trim: true,
    },
    lyricsLanguage: {
      type: String,
      required: true,
      trim: true,
    },

    pLine: {
      type: String,
      required: true,
      trim: true,
    },
    cLine: {
      type: String,
      required: true,
      trim: true,
    },
    titleLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    productionYear: {
      type: String,
      required: true,
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },

    instrumental: {
      type: Boolean,
      default: false,
    },
    parentalAdvisory: {
      type: Boolean,
      default: false,
    },
    isrcGeneration: {
      type: Boolean,
      default: false,
    },
    crbtCut: {
      type: Boolean,
      default: false,
    },

    // Files
    audioUrl: {
      type: String,
      required: true,
    },
    coverArtUrl: {
      type: String,
      required: true,
    },

    // 🔴 Status fields
    // allowed values: "pending", "live", "suspend", "reject", "hold", "custom", etc.
    status: {
      type: String,
      default: "pending",
      trim: true,
    },
    // reason / description — used specially for suspend, reject or custom like "hold"
    statusDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// generate unique publicId before first save
trackSchema.pre("save", function (next) {
  if (!this.publicId) {
    this.publicId = generatePublicId();
  }
  next();
});

const TrackModel = mongoose.model("track", trackSchema);
module.exports = TrackModel;
