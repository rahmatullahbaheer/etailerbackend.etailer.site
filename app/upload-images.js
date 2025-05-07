const express = require("express");
const path = require("path");
const multer = require("multer");

const pool = require("./config/db"); // Fix import
const router = express.Router();

// Multer storage setup for file uploads
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
    fileSize: 1000000000, // 1000 MB
  },
  fileFilter: fileFilter,
});

// CRUD Routes

// 1. Create: Upload an image and save to the database
router.post("/image", upload.single("image"),async (req, res) => {
//  return res
//       .status(200)
//       .json({ message: "server ddddddd"});
  try {
    const imagePath = req.file.path;
    const { user_id, imageType } = req.body;

    const data = await pool.query(
      "INSERT INTO images (user_id,imageType ,image_url) VALUES (?, ?, ?)",
      [user_id,imageType , imagePath]
    );

    return res.status(201).json({
      error: false,
      message: "Image uploaded successfully",
     
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error uploading image" });
  }
});

// 2. Read: Get images for a specific user with optional imageType filter
// router.get("/image", async (req, res) => {
//   try {
//     const { userId, imageType } = req.query;
//     let query = "SELECT * FROM images WHERE user_id = ?";
//     const queryParams = [userId];

//     if (imageType) {
//       query += " AND imageType = ?";
//       queryParams.push(imageType);
//     }

//     const [result] = await pool.query(query, queryParams);
//     return res.status(200).json({
//       data: result,
//       message: "Images fetched successfully",
//       error: false,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "Error fetching images" });
//   }
// });

module.exports = router;
