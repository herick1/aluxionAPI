const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const User = require('../model/user');

aws.config.update({
  secretAccessKey: process.env.Secret_AWS,
  accessKeyId:  process.env.Key_AWS,
  region: process.env.region
});

const s3 = new aws.S3();
const Bucket = process.env.Bucket_AWS;

const getAllFiles = async () => {
  try {
    return await s3.listObjectsV2({ Bucket }).promise();
  } catch (err) {
    return err;
  }
};

const deleteSingleFile = async (Key) => {
  try {
    return await s3.deleteObject({ Bucket, Key }).promise();
  } catch (err) {
    return err;
  }
};

const deleteMultipleFiles = async (Objects) => {
  const params = { Bucket, Delete: { Objects, Quiet: false } };
  try {
    return s3.deleteObjects(params).promise();
  } catch (err) {
    return err;
  }
};

const uploadSingleFile = multer({
  limits: { files: 1, fileSize: 1024 * 1024 },
  storage: multerS3({
    s3,
    bucket: Bucket,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: "file_metadata" });
    },
    key: async (req, file, cb) => {
      var user = await User.findOne({ email : req.user.email });
      cb(null, user._id + file.originalname);
    },
  }),
});


const uploadSingleFileByurl = async (name, Objects) => {

  try {
      return await s3.upload({
                Body: Objects,
                Key: name,
                Bucket: Bucket
            }).promise();
  } catch (err) {
    console.log(err)
    return err;
  }
};


module.exports = {
  uploadSingleFile,
  getAllFiles,
  deleteSingleFile,
  deleteMultipleFiles,
  uploadSingleFileByurl
};
