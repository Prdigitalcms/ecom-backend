const Imagekit = require("imagekit");

const storageIntance = new Imagekit({
  publicKey: process.env.Imagekit_Public_key,
  privateKey: process.env.Imagekit_Private_key,
  urlEndpoint: process.env.Imagekit_URL_Endpoint,
});

const uploadImage = async (fileBuffer, originalname) => {
  try {
    const res = await storageIntance.upload({
      file: fileBuffer,
      fileName: originalname,
      folder: "pr-digital",
    });
    return res;
  } catch (error) {
    console.log("Error in uploading image", error);
  }
};

module.exports = uploadImage;
