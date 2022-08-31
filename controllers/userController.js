const crypto = require("crypto");
const accoutSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accoutSid, authToken);
const smsKey = process.env.SMS_SECRET_KEY;
const userHelper = require("../helpers/user-helper");
const productHelper = require("../helpers/product-helpers");
const adminHelper = require("../helpers/admin-helper");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
let msg = false;
const db = require("../config/connection");
const collections = require("../config/collections");
exports.login = async (req, res, next) => {
  try {
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.userLoggedIn = true;
        req.session.user = response.user;
        const accessToken = jwt.sign(
          { data: response.user.phone },
          JWT_AUTH_TOKEN,
          { expiresIn: "99999999s" }
        );
        res
          .status(202)
          .cookie("accessToken", accessToken, {
            expires: new Date(new Date().getTime + 30 * 1000),
            sameSite: "strict",
            httpOnly: true,
          })
          .redirect("/");
      } else {
        msg = response.msg;
        req.session.userLoginErr = "invalid user name or password";
        res.redirect("/login");
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.home = async function (req, res, next) {
  try {
    let user = req.session.user;
    let cartCount = null;
    let wishlist = null;
    if (user) {
      cartCount = await userHelper.cartCount(user._id);
      wishlist = await userHelper.getWishProd(user._id);
      wishlist = wishlist?.products;
    }
    let newProducts = await db
      .get()
      .collection(collections.PRODUCT_COLLECTION)
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // res.render("user/view-products", { user });
    productHelper.getAllProducts().then((products) => {
      adminHelper.getCategories().then((categories) => {
        productHelper.getAllProducts().then((products2) => {
          res.render("user/view-products", {
            products,
            user,
            cartCount,
            wishlist,
            categories,
            products2,
            newProducts,
          });
        });
      });
    });
  } catch (err) {
    loginWarn = req.session.noUser;
    res.render("user/view-products", { loginWarn });
    console.log(err);
  }
};

exports.viewLogin = (req, res) => {
  try {
    if (req.session.userLoggedIn) {
      res.redirect("/");
    } else {
      if (msg) {
        res.render("user/login", { loginErr: msg });
        msg = false;
      } else {
        res.render("user/login", { loginErr: req.session.userLoginErr });
        req.session.userLoginErr = false;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

let message = "";
exports.viewSignUp = (req, res) => {
  try {
    if (req.session.userLoggedIn) {
      res.redirect("/");
    } else {
      res.render("user/signup", { message });
      message = "";
    }
  } catch (err) {
    console.log(err);
  }
};

exports.SignUp = (req, res) => {
  try {
    const user = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };
    userHelper.doSignup(user).then((response) => {
      if (response.Err) {
        message = response.msg;
        res.redirect("/signup");
      } else {
        req.session.userLoggedIn = true;
        req.session.user = response;
        const accessToken = jwt.sign({ data: response.phone }, JWT_AUTH_TOKEN, {
          expiresIn: "99999999s",
        });
        res
          .status(202)
          .cookie("accessToken", accessToken, {
            expires: new Date(new Date().getTime + 30 * 1000),
            sameSite: "strict",
            httpOnly: true,
          })
          .redirect("/");
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = (req, res) => {
  try {
    req.session.user = null;
    req.session.userLoggedIn = false;
    res
      .clearCookie("refreshToken")
      .clearCookie("accessToken")
      .clearCookie("authSession")
      .clearCookie("refreshTokenID")
      .redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.viewCart = async (req, res) => {
  try {
    let products = await userHelper.getCartProducts(req.session.user._id);

    let total = await userHelper.getTotalAmount(req.session.user._id);
    products.forEach((data) => {
      console.log("..........................", data);
      data.subTotal = Number(data.quantity) * Number(data.product.price);
    });
    res.render("user/cart", { products, total, user: req.session.user });
  } catch (err) {
    console.log(err);
  }
};

exports.addToCart = (req, res) => {
  try {
    if (req.session.verifyErr) {
      res.render("/Login");
    } else {
      userHelper.addToCart(req.query.id, req.session.user._id).then(() => {
        res.json({ status: true });
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.changeCartQuantity = (req, res) => {
  try {
    let price = 0;
    productHelper.productsDetails(req.body.product).then((response) => {
      price = response.price;
    });
    // console.log(price);
    userHelper.changeCartQuantity(req.body).then(async (response) => {
      let total = await userHelper.getTotalAmount(req.session.user?._id);

      response.total = total;
      response.price = price;
      res.json(response);
    });
  } catch (err) {
    console.log(err);
    console.log(req.body);
  }
};

exports.deleteProduct = (req, res) => {
  try {
    userHelper.deleteProduct(req.body).then(() => {
      res.json({ status: true });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.viewPlaceOrder = async (req, res) => {
  try {
    let total = await userHelper.getTotalAmount(req.session.user._id);
    let user = await adminHelper.userDetails(req.session.user._id);
    let addresses = false;
    if (user.addresses) {
      addresses = user.addresses;
    }
    res.render("user/placeorder", { total, user: req.session.user, addresses });
  } catch (err) {
    console.log(err);
  }
};

exports.placeOrder = async (req, res) => {
  try {
    console.log("Checkout form body", req.body);
    console.log("========");
    let products = await userHelper.orderProducts(req.session.user._id);
    let user = await adminHelper.userDetails(req.session.user._id);
   
    let totalPrice = await userHelper.getTotalAmount(req.session.user._id);
    req.body.UserId = req.session.user._id;
    userHelper.orderPlace(req.body, products, totalPrice).then((orderId) => {
      if (req.body["Payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelper
          .generateRazorPay(orderId, totalPrice)
          .then((order) => {
            order.user = user;
            res.json(order);
          })
          .catch((err) => {
            console.log("#### err");
            console.log(err);
            res.status(500).json({ paymentErr: true });
          });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.orderSuccess = async (req, res) => {
  try {
    res.render("user/orderSuccess");
  } catch (err) {
    console.log(err);
  }
};

exports.viewOrders = async (req, res) => {
  try {
    let orders = await userHelper.getOrders(req.session.user._id);

   let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    orders.forEach(data => {
      // console.log(data.deliveryDetails.Date);
      data.date=(data.deliveryDetails.Date.toLocaleDateString("en-US", options))
      
      });
      console.log("changed orders",orders);
    res.render("user/orders", { user: req.session.user, orders });
  } catch (err) {
    console.log(err);
  }
};

exports.viewOrderProducts = async (req, res) => {
  try {
   
    let product = await userHelper.orderedProducts(req.query.id);
 
    res.render("user/orderProducts", { user: req.session.user, product });
  } catch (err) {
    console.log(err);
  }
};                    

exports.verifyPayment = async (req, res) => {
  try {
 
    userHelper
      .verifyPayment(req.body)
      .then(() => {
        console.log("paymentSuccess");
        userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          res.json({ status: true });
        });
      })
      .catch(() => {
        console.log("payment err");
        res.json({ status: false, errmsg: "payment-failed" });
      });
  } catch (err) {
    console.log(err);
  }
};

exports.viewwishList = async (req, res) => {
  try {
    let products = await userHelper.getWishlist(req.session.user._id);
    res.render("user/wishlist", { products, user: req.session.user });
  } catch (err) {
    console.log(err);
  }
};

exports.removeWishList = (req, res) => {
  try {
    userHelper
      .removeWish(req.session.user._id, req.query.id)
      .then((response) => {
        res.json({ status: true });
      });
  } catch (err) {
    console.log(err);
  }
};

exports.search = (req, res) => {
  try {
    userHelper.search(req.query.val).then((data) => {
      res.json(data);
    });
  } catch (err) {
    console.log(err);
  }
};
exports.wishList = (req, res) => {
  try {
    userHelper.wishList(req.body).then((response) => {
      res.json(response);
    });
  } catch (err) {
    console.log(err);
  }
};
exports.viewSendOTP = (req, res) => {
  try {
    res.render("user/otpLogin");
  } catch (err) {
    console.log(err);
  }
};
exports.sendOTP = (req, res) => {
  try {
    const phone = req.body.phone;
    userHelper.sendOTP(phone).then(async (response) => {
      const phone = response.phone;

      req.session.tempUser = response;
      const otp = Math.floor(100000 + Math.random() * 900000);
      const ttl = 2 * 60 * 1000;
      const expires = Date.now() + ttl;
      const data = `${phone}.${otp}.${expires}`;

      const hash = crypto
        .createHmac("sha256", smsKey)
        .update(data)
        .digest("hex");

      const fullhash = `${hash}.${expires}`;

      client.messages
        .create({
          body: `Your one time password for login is ${otp} `,
          from: +16415521519,
          to: `+91` + phone,
        })
        .then((message) => {})
        .catch((err) => {
          console.error(err);
        });
      await res
        .status(200)
        .cookie("hash", fullhash, {
          expires: new Date(new Date().getTime + 30 * 10000),
          sameSite: "strict",
          httpOnly: true,
        })
        .cookie("phone", phone, {
          expires: new Date(new Date().getTime + 30 * 10000),
          sameSite: "strict",
          httpOnly: true,
        })
        .render("user/verifyOTP");
      // .send({ phone, hash: fullhash, otp })
      console.log(otp);
    });
  } catch (err) {
    console.log(err);
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const phone = req.cookies.phone;

    const hash = req.cookies.hash;

    const otp = req.body.otp;

    let [hashValue, expires] = hash.split(".");
    let now = Date.now();
    if (now > parseInt(expires)) {
      return res.status(504).send({ msg: "Timeout please try again" });
    }
    const data = `${phone}.${otp}.${expires}`;

    const newCalculatedHash = crypto
      .createHmac("sha256", smsKey)
      .update(data)
      .digest("hex");

    if (newCalculatedHash === hashValue) {
      const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, {
        expiresIn: "300000s",
      });
      req.session.loggedIn = true;
      req.session.user = req.session.tempUser;
      await res
        .status(202)
        .cookie("accessToken", accessToken, {
          expires: new Date(new Date().getTime + 30 * 1000),
          sameSite: "strict",
          httpOnly: true,
        })
        .cookie("authSession", true, {
          expires: new Date(new Date().getTime + 30 * 1000),
        })

        .redirect("/");
    } else {
      return res.status(400).render("user/verifyOTP", { msg: "incorrect otp" });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.productsDetails = async (req, res) => {
  try {
    let user = req.session.user;
    let cartCount = null;
    let wishlist = null;
    if (user) {
      cartCount = await userHelper.cartCount(user._id);
      wishlist = await userHelper.getWishProd(user._id);
      wishlist = wishlist?.products;
    }
    let proId = req.query.id;

    let product = await productHelper.productsDetails(proId);
    let category = await productHelper.categoryDetails(product.category);
    res.render("user/products", {
      product,
      user,
      cartCount,
      wishlist,
      category,
    });
  } catch (err) {
    console.log(err);
  }
};
let updatedUser = false;
exports.profile = async (req, res) => {
  try {
    let user = req.session.user;

    if (updatedUser) {
      user = updatedUser;
      req.session.user = updatedUser;
    }
    let cartCount = null;
    let wishlist = null;
    if (user) {
      cartCount = await userHelper.cartCount(user._id);
      wishlist = await userHelper.getWishProd(user._id);
    }

    res.render("user/profile", { user, cartCount, wishlist });
  } catch (err) {
    console.log(err);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let userId = req.session.user._id;

    userHelper.updateProfile(userId, req.body).then(() => {
      adminHelper.userDetails(userId).then((response) => {
        req.session.updatedUser = response;
        updatedUser = response;
      });

      res.redirect("/profile");
    });
  } catch (err) {
    console.log(err);
  }
};
exports.addAddress = async (req, res, next) => {
  try {
    let userId = req.session.user._id;

    userHelper.addAddress(userId, req.body).then(() => {
      adminHelper.userDetails(userId).then((response) => {
        req.session.updatedUser = response;
        updatedUser = response;
      });

      res.redirect("/profile");
    });
  } catch (err) {
    console.log(err);
  }
};
exports.addAddress2 = async (req, res, next) => {
  try {
    let userId = req.session.user._id;

    userHelper.addAddress(userId, req.body).then(() => {
      adminHelper.userDetails(userId).then((response) => {
        req.session.updatedUser = response;
        updatedUser = response;
      });

      res.redirect("/place-order");
    });
  } catch (err) {
    console.log(err);
  }
};
