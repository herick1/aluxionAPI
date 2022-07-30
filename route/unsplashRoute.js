const express = require("express");
const router = express.Router();
const request = require('request');
const fetch = require('node-fetch')
const auth = require("../middleware/auth");

  const domain = "https://api.unsplash.com"
  const endpoint = "/search/photos"

router.get("/all-images", auth, async (req, res) => {

  var search_parameter = req.query.search;
  var url = domain + endpoint +"?query=" + search_parameter + "&client_id=" + process.env.UNSPLASH_ACCESS_KEY ;

  try {
    var res_fetch = await fetch(url)
    const result = await res_fetch.json();
	res.status(200).json({ message: "success", result});
 
  } catch (err) {
  	console.log(err)
    return res.status(400).json({ error: err });
  }

});

module.exports = router;