// middlewares/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Multer storage setup
const multerMiddleWareStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads/");
  },
  filename: (req, file, callBack) => {
    const originalname = file.originalname.replace(/\s/g, ""); // Remove spaces
    const timestamp = Date.now();
    const extension = path.extname(originalname);
    callBack(
      null,
      `${path.basename(originalname, extension)}${timestamp}${extension}`
    );
  },
});

// File filter for accepted file types
const fileFilter = (req, file, callBack) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/vnd.android.package-archive",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    callBack(null, true);
  } else {
    callBack(null, false);
  }
};

// Initialize multer
const upload = multer({
  storage: multerMiddleWareStorage,
  limits: {
    fileSize: 1000 * 1000 * 1000, // 1000 MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
