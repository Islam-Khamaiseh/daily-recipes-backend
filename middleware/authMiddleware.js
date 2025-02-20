// const { getAuth } = require("firebase-admin/auth");

// const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).send({ message: "Unauthorized: No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decodedToken = await getAuth().verifyIdToken(token);
//     console.log("Token verified successfully. User:", decodedToken);
//     req.userId = decodedToken.uid; // Use the correct field from the token
//     next();
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     return res.status(401).send({ message: "Unauthorized: Invalid token" });
//   }
// };

// module.exports = verifyToken;

//

const { admin } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error("Authorization header is missing");
    return res.status(401).send("Unauthorized: No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("Bearer token is missing");
    return res.status(401).send("Unauthorized: Invalid token format");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    console.log("Token verified successfully. User:", decodedToken);

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return res.status(403).send("Unauthorized: Token verification failed");
  }
};

module.exports = verifyToken;

// const { admin } = require("../config/firebase");

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     console.error("No token provided");
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     const decoded = admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     console.log("Token verified:", req.user);
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     return res.status(403).send("Invalid or expired token");
//   }
// };

// module.exports = verifyToken;
