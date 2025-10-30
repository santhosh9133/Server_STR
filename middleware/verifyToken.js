// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// exports.verifyAdminToken = async function(req, res, next) {
//     try {
//         let expired = null;
//         const bearerHeader = req.headers["authorization"];
//         let bearerToken = "";
//         if (bearerHeader) {
//             bearerToken = bearerHeader.split(" ")[1];
//         }
//          console.log(bearerToken)
//         if (bearerToken) {
//             jwt.verify(
//                 bearerToken,
//                 process.env.JWT_SECRET,
//                 function(err, decoded) {
//                     if (err) {
//                         try {
//                             expired = err;
//                             res.status(401).json({
//                                 status: false,
//                                 message: "Your session has expired. Please login.",
//                                 expired,
//                             });
//                         } catch (err) {
//                             res.status(401).json({
//                                 status: false,
//                                 message: "Your session has expired. Please login.",
//                                 err,
//                             });
//                         }
//                     }
//                     if (decoded) {
//                         req.userId = decoded.userId;
//                         req.staffId = decoded.staffId;
//                         req.loginTime = decoded.iat;
//                         // console.log(req.userId);
//                         //iat: 1666000967,
//                         // exp: 1666087367
//                         next();
//                     }
//                 }
//             );
//         } else {
//             res
//                 .status(400)
//                 .json({ status: false, message: "Bearer token not defined" });
//         }
//     } catch (err) {
//         console.log("eror", err);
//         if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
//             return res
//                 .status(401)
//                 .json({ status: false, message: "Session Expired Error", Error: err });
//         } else {
//             res
//                 .status(401)
//                 .json({ status: false, message: "Internal Server Error", error: err });
//         }
//     }
// };



const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyAdminToken = (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader)
      return res
        .status(400)
        .json({ status: false, message: "Bearer token not defined" });

    const token = bearerHeader.split(" ")[1];
    // console.log("JWT Token:", token);

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set req.user with _id and role (must match your controller)
    req.user = {
     // _id: decoded.userId || decoded.staffId, // make sure your JWT has userId or staffId
     _id: decoded.userId || decoded.staffId || decoded.id, // add decoded.id
      role: decoded.role, // must be "Admin" or "Employee"
    };

    next();
  } catch (err) {
    console.error("Token error:", err);
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Token expired or invalid",
        error: err.message,
      });
    }
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
