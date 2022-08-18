const jwt = require("jsonwebtoken");
var db = require("./config/connection");
var collections = require("./config/collections");
require("dotenv").config();
let phoneNo = 0
exports.verify = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    jwt.verify(accessToken, process.env.JWT_AUTH_TOKEN, async (err, phone) => {
      if (phone) {
        req.phone = phone;
        phoneNo = phone
        next();
      } else if (err.message === "TokenExpiredError") {
        return res.status(403).redirect("/Login");
      } else {
        console.error(err);
        res.status(403).redirect("/Login");
      }
    });
   let  user=db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone:phoneNo })
        if (user.blocked) {
          res.status(403).redirect("/Login");
        }

      console.log(user);
  } catch (err) {
    console.log(err);
  }
};
