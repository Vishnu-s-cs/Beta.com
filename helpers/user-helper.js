var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
var objectId = require("mongodb").ObjectId;
var Razorpay = require("razorpay");
const { resolveCname } = require("dns");
const { resolve } = require("path");

var instance = new Razorpay({
  key_id: "rzp_test_74IUoLSXBjLRXM",
  key_secret: "o3po6jeg50ebWG1bvYNjfT1e",
});
module.exports = {
  doSignup: (userData) => {
    let res = null;
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: userData.email })
        .then((result) => {
          if (result) {
            res = { Err: true, msg: "Email already registered" };
            resolve(res);
          }
        });
      await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: userData.phone })
        .then((result) => {
          if (result) {
            res = { Err: true, msg: "Phone no. already registered" };
            resolve(res);
          }
        });
      if (res == null) {
        userData.password = await bcrypt.hash(userData.password, 10);
        await db
          .get()
          .collection(collections.USER_COLLECTION)
          .insertOne(userData);
        await db
          .get()
          .collection(collections.USER_COLLECTION)
          .createIndex({ email: 1 }, { unique: true });
        resolve(userData);
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: userData.email });
      
      if (user) {
        if (user.blocked) {
           var msg = "user blocked"
            resolve({ Status: false,msg});
        }
        else
        {bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("failed to connect");
            resolve({ Status: false });
          }
        });}
      } else {
        console.log("no user found");
        resolve({ Status: false });
      }
    });
  },
  addToCart: (proId, userId) => {
    let prodObj = {
      item: objectId(proId),
      quandity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExits = userCart.products.findIndex(
          (products) => products.item == proId
        );

        if (proExits != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quandity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quandity: "$products.quandity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quandity: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  cartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeCartQuandity: (details) => {
    return new Promise((resolve, reject) => {
      let count = parseInt(details.count);

      if (count == -1 && details.quandity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then(() => {
            console.log("deleted");
            resolve({ deleteProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quandity": count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
  deteProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quandity: "$products.quandity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quandity: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quandity", "$product.prize"] } },
            },
          },
        ])
        .toArray();
      if (total == "") {
        resolve();
      } else {
        resolve(total[0].total);
      }
    });
  },
  orderProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) }, { products: 1 })
        .then((response) => {
          let products = response;
          console.log("==", products);
          resolve(products);
        });
    });
  },
  orderPlace: (order, products, totalPrice) => {
    return new Promise((resolve, reject) => {
      let status = order["Payment-method"] === "COD" ? "placed" : "pending";

      let orderObj = {
        deliveryDetails: {
          address: order.Address,
          pincode: order.Pincode,
          mobile_No: order["Mobile No"],

          Date: new Date(),
        },
        userId: objectId(order.UserId),
        payment_Method: order["Payment-method"],
        status: status,
        totalAmount: totalPrice,
        products: products,
      };

      db.get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((responce) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .removeOne({ user: objectId(order.UserId) });

          resolve(responce.ops[0]._id);
        });
    });
  },
  getOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .toArray();
      resolve(order);
    });
  },
  orderedProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      console.log("orderID", orderId);

      let products = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quandity: "$products.quandity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quandity: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray();

      resolve(products);
    });
  },
  generateRazorPay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);

          reject(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "o3po6jeg50ebWG1bvYNjfT1e");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject;
      }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: { status: "placed" },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  wishList: (details) => {
    return new Promise(async (resolve, reject) => {
      let wish = await db
        .get()
        .collection(collections.WISHLIST_COLLECTION)
        .findOne({ userId: objectId(details.user) });

      if (wish) {
        let prod = wish.products.findIndex(
          (products) => products == details.proId
        );
        if (prod != -1) {
          db.get()
            .collection(collections.WISHLIST_COLLECTION)
            .updateOne(
              { userId: objectId(details.user) },
              {
                $pull: { products: objectId(details.proId) },
              }
            )
            .then(() => {
              resolve({ status: false });
            });
        } else {
          db.get()
            .collection(collections.WISHLIST_COLLECTION)
            .updateOne(
              { userId: objectId(details.user) },
              {
                $push: { products: objectId(details.proId) },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      } else {
        let wishObj = {
          userId: objectId(details.user),
          products: [objectId(details.proId)],
        };
        db.get()
          .collection(collections.WISHLIST_COLLECTION)
          .insertOne(wishObj)
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
  getWishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishList = await db
        .get()
        .collection(collections.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { userId: objectId(userId) },
          },
          {
            $unwind: "$products",
          },

          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "products",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray();

      resolve(wishList);
    });
  },
  removeWish: (user, pro) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.WISHLIST_COLLECTION)
        .updateOne(
          { userId: objectId(user) },
          {
            $pull: { products: objectId(pro) },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getWishPord: (user) => {
    return new Promise(async (resolve, reject) => {
      let prods = await db
        .get()
        .collection(collections.WISHLIST_COLLECTION)
        .findOne({ userId: objectId(user) });
      resolve(prods);
    });
  },
  search: (val) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find({ productname: { $regex: val, $options: "$i" } })
        .toArray();
      resolve(data);
    });
  },
  sendOTP: (phone) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: phone })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
};
