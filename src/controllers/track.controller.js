const TrackModel = require("../models/track.model");
const uploadImage = require("../services/storage.services");

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const str = String(value).toLowerCase();
  return str === "true" || str === "1" || str === "on" || str === "yes";
};

// 1) CREATE TRACK (user upload) – same as before but now schema has publicId + status
const createTrackController = async (req, res) => {
  try {
    const {
      title,
      label,
      upcEan,
      primaryArtist,
      featuring,
      lyricist,
      composer,
      arranger,
      producer,
      genre,
      lyricsLanguage,
      pLine,
      cLine,
      titleLanguage,
      productionYear,
      releaseDate,
    } = req.body;

    const audioFile = req.files?.audioFile?.[0];
    const coverArt = req.files?.coverArt?.[0];

    const errors = {};

    const requiredTextFields = {
      title,
      label,
      primaryArtist,
      lyricist,
      composer,
      genre,
      lyricsLanguage,
      pLine,
      cLine,
      titleLanguage,
      productionYear,
      releaseDate,
    };

    Object.entries(requiredTextFields).forEach(([key, value]) => {
      if (!value || !String(value).trim()) {
        errors[key] = `${key} is required`;
      }
    });

    // audio validation
    if (!audioFile) {
      errors.audioFile = "Audio file is required";
    } else {
      const audioFormats = ["audio/wav", "audio/mpeg", "audio/mp3"];
      if (!audioFormats.includes(audioFile.mimetype)) {
        errors.audioFile = "Audio file must be WAV or MP3 format";
      }
      const maxAudioSizeBytes = 50 * 1024 * 1024;
      if (audioFile.size > maxAudioSizeBytes) {
        errors.audioFile = "Audio file must be less than 50MB";
      }
    }

    // cover validation
    if (!coverArt) {
      errors.coverArt = "Cover art is required";
    } else {
      const imageFormats = ["image/jpeg", "image/png"];
      if (!imageFormats.includes(coverArt.mimetype)) {
        errors.coverArt = "Cover art must be JPEG or PNG format";
      }
      const maxImageSizeBytes = 10 * 1024 * 1024;
      if (coverArt.size > maxImageSizeBytes) {
        errors.coverArt = "Cover art must be less than 10MB";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        msg: "Validation failed",
        errors,
      });
    }

    const [audioUpload, coverUpload] = await Promise.all([
      uploadImage(audioFile.buffer, audioFile.originalname),
      uploadImage(coverArt.buffer, coverArt.originalname),
    ]);

    if (!audioUpload?.url || !coverUpload?.url) {
      return res.status(500).json({
        msg: "Failed to upload files",
      });
    }

    const track = await TrackModel.create({
      user: req.user._id,
      title: title.trim(),
      label: label.trim(),
      upcEan: upcEan ? String(upcEan).trim() : undefined,
      primaryArtist: primaryArtist.trim(),
      featuring: featuring ? String(featuring).trim() : undefined,
      lyricist: lyricist.trim(),
      composer: composer.trim(),
      arranger: arranger ? String(arranger).trim() : undefined,
      producer: producer ? String(producer).trim() : undefined,
      genre: genre.trim(),
      lyricsLanguage: lyricsLanguage.trim(),
      pLine: pLine.trim(),
      cLine: cLine.trim(),
      titleLanguage: titleLanguage.trim(),
      productionYear: String(productionYear).trim(),
      releaseDate: new Date(releaseDate),
      instrumental: toBoolean(req.body.instrumental),
      parentalAdvisory: toBoolean(req.body.parentalAdvisory),
      isrcGeneration: toBoolean(req.body.isrcGeneration),
      crbtCut: toBoolean(req.body.crbtCut),
      audioUrl: audioUpload.url,
      coverArtUrl: coverUpload.url,
      // status & publicId handled by schema defaults / pre-save
    });

    return res.status(201).json({
      msg: "Track uploaded successfully",
      track,
    });
  } catch (error) {
    console.error("Error in createTrackController", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 2) LIST MY TRACKS with filter, sort, search, pagination
const getMyTracksController = async (req, res) => {

  try {
    const userId = req.user._id;
  console.log(userId)
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    page = Math.max(parseInt(page, 10) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = { user: userId };

    // status filter (status=all -> no filter)
    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { primaryArtist: regex },
        { publicId: regex },
        { label: regex },
      ];
    }

    const allowedSortFields = ["createdAt", "title", "status", "publicId"];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "createdAt";
    }

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [tracks, totalItems] = await Promise.all([
      TrackModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      TrackModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      msg: "Tracks fetched successfully",
      tracks,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error in getMyTracksController", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 3) GET SINGLE TRACK (details)
const getTrackByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await TrackModel.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!track) {
      return res.status(404).json({
        msg: "Track not found",
      });
    }

    return res.status(200).json({
      msg: "Track fetched successfully",
      track,
    });
  } catch (error) {
    console.error("Error in getTrackByIdController", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 4) UPDATE TRACK (user can edit everything except audio file & publicId & status)
const updateTrackDetailsController = async (req, res) => {
  try {
    const { id } = req.params;

    let track = await TrackModel.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!track) {
      return res.status(404).json({
        msg: "Track not found",
      });
    }

    const updatableFields = [
      "title",
      "label",
      "upcEan",
      "primaryArtist",
      "featuring",
      "lyricist",
      "composer",
      "arranger",
      "producer",
      "genre",
      "lyricsLanguage",
      "pLine",
      "cLine",
      "titleLanguage",
      "productionYear",
      "releaseDate",
      "instrumental",
      "parentalAdvisory",
      "isrcGeneration",
      "crbtCut",
    ];

    updatableFields.forEach((field) => {
      if (field in req.body) {
        if (["instrumental", "parentalAdvisory", "isrcGeneration", "crbtCut"].includes(field)) {
          track[field] = toBoolean(req.body[field]);
        } else if (field === "releaseDate") {
          track.releaseDate = new Date(req.body.releaseDate);
        } else {
          track[field] = String(req.body[field]).trim();
        }
      }
    });

    // optional new cover art
    const coverArt = req.files?.coverArt?.[0];
    if (coverArt) {
      const imageFormats = ["image/jpeg", "image/png"];
      if (!imageFormats.includes(coverArt.mimetype)) {
        return res.status(422).json({
          msg: "Validation failed",
          errors: { coverArt: "Cover art must be JPEG or PNG format" },
        });
      }

      const maxImageSizeBytes = 10 * 1024 * 1024;
      if (coverArt.size > maxImageSizeBytes) {
        return res.status(422).json({
          msg: "Validation failed",
          errors: { coverArt: "Cover art must be less than 10MB" },
        });
      }

      const coverUpload = await uploadImage(
        coverArt.buffer,
        coverArt.originalname
      );

      if (!coverUpload?.url) {
        return res.status(500).json({
          msg: "Failed to upload cover art",
        });
      }

      track.coverArtUrl = coverUpload.url;
    }

    // ❌ user cannot change audioUrl, publicId, status here
    await track.save();

    return res.status(200).json({
      msg: "Track updated successfully",
      track,
    });
  } catch (error) {
    console.error("Error in updateTrackDetailsController", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 5) (optional) ADMIN: update status & reason
// ⚠️ IMPORTANT: add proper admin check where you call this.
const updateTrackStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusDescription } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(422).json({
        msg: "Status is required",
      });
    }

    const track = await TrackModel.findById(id);
    if (!track) {
      return res.status(404).json({
        msg: "Track not found",
      });
    }

    track.status = status.trim().toLowerCase(); // e.g. 'pending','live','suspend','reject','hold'
    track.statusDescription = statusDescription
      ? String(statusDescription).trim()
      : undefined;

    await track.save();

    return res.status(200).json({
      msg: "Status updated successfully",
      track,
    });
  } catch (error) {
    console.error("Error in updateTrackStatusController", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

module.exports = {
  createTrackController,
  getMyTracksController,
  getTrackByIdController,
  updateTrackDetailsController,
  updateTrackStatusController,
};
