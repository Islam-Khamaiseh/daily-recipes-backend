const { admin } = require("../config/firebase");

const optionalVerifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Invalid token:", error.message);
    req.user = null;
    next();
  }
};

module.exports = optionalVerifyToken;
