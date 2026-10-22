
const mongoose = require("mongoose");
const { Readable } = require("stream");

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected.");
  }

  return new mongoose.mongo.GridFSBucket(
    mongoose.connection.db,
    { bucketName: "studygramMedia" }
  );
}

function uploadBuffer(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });

    uploadStream.on("error", reject);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
}

module.exports = { getBucket, uploadBuffer };
