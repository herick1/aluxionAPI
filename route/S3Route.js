const express = require("express");
const s3FileController = require("../services/S3FileController");
const router = express.Router();
const request = require('request');

router.post("/upload-single-image", (req, res) => {
  const upload = s3FileController.uploadSingleFile.single("image");
  upload(req, res, (err) => {
    if (err) {
      return res.json({ code: "file upload error", message: err.message });
    }
    return res.json({ resp: req.file });
  });
});

router.get("/all-images", (req, res) => {
  s3FileController
    .getAllFiles()
    .catch((err) => {
      res.json({ err: err });
    })
    .then((data) => {
      res.json({ data: data });
    });
});

router.delete("/delete-single-image", (req, res) => {
  console.log(req.query)
  s3FileController
    .deleteSingleFile(req.query.key)
    .catch((err) => {
      res.status(400).json({ err: err });
    })
    .then((data) => {
      res.status(200).json({ message: "success", data });
    });
});

router.delete("/delete-multiple-images", (req, res) => {
  s3FileController
    .deleteMultipleFiles(req.body)
    .catch((err) => {
      res.status(400).json({ err: err });
    })
    .then((data) => {
      res.status(200).json({ message: "success", data });
    });
});




router.post("/upload-single-image-from-url", async (req, res) => {
  var options = {
      uri: req.body.url,
      encoding: null
  };
  try {
    await request(options, function(error, response, body) {
      if (error || response.statusCode !== 200) { 
          console.log("failed to get image");
      } else {
        
        s3FileController
        .uploadSingleFileByurl(req.body.name, body)
        .catch((err) => {
          res.status(400).json({ error: err });
        })
        .then((data) => {
          res.status(200).json({ message: "success", data });
        });
      } 
    })  
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

module.exports = router;
