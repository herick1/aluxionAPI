const express = require("express");
const s3FileController = require("../services/S3FileController");
const router = express.Router();
const request = require('request');
const auth = require("../middleware/auth");
const Files = require('../model/files');
const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');

router.post("/upload",auth , (req, res) => {

  const upload = s3FileController.uploadSingleFile.single("image");
  const email = req.user.email
  upload(req, res, async (err) => {
    if (err) {
      return res.json({ code: "file upload error", message: err.message });
    }

    var files =await Files.findOne({ $and: [{ email: email }, { originalname: req.file.originalname }] });


    if(files == null){
      files = await Files.create({
        email: email,
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        location: req.file.location,
        key: req.file.key
      });
    }
    return res.json({ resp: files });
  });
});


router.get("/download", auth, async (req, res) => {
  const name = req.query.file
  const email = req.user.email
  var files = await Files.findOne({ $and: [{ email: email }, { originalname: name }] });
  console.log(files)
  if(files == null){
    return res.status(400).send("No existe el archivo");
  }
  
  const externalRequest = http.get(files.location, (externalRes) => {
    res.setHeader('Content-Disposition', 'attachment; filename="'+ name+'"');
    externalRes.pipe(res);
  });
  return externalRequest.end();

});

router.post("/list-user-files", auth, (req, res) => {
  const upload = s3FileController.uploadSingleFile.single("image");
  upload(req, res, (err) => {
    if (err) {
      return res.json({ code: "file upload error", message: err.message });
    }
    return res.json({ resp: req.file });
  });
});


router.post("/change-name", auth, (req, res) => {
  const upload = s3FileController.uploadSingleFile.single("image");
  upload(req, res, (err) => {
    if (err) {
      return res.json({ code: "file upload error", message: err.message });
    }
    return res.json({ resp: req.file });
  });
});

router.get("/all-images-in-bucket", (req, res) => {
  s3FileController
    .getAllFiles()
    .catch((err) => {
      res.json({ err: err });
    })
    .then((data) => {
      res.json({ data: data });
    });
});

router.delete("/delete-single-image", auth, (req, res) => {
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

router.delete("/delete-multiple-images", auth, (req, res) => {
  s3FileController
    .deleteMultipleFiles(req.body)
    .catch((err) => {
      res.status(400).json({ err: err });
    })
    .then((data) => {
      res.status(200).json({ message: "success", data });
    });
});




router.post("/upload-single-image-from-url",auth, async (req, res) => {
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
