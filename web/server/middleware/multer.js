import multer from "multer";
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, //15MB
  fileFilter: (req, file, cb) => {
    // if (file.mimetype.startsWith("image/")) {
    //   cb(null, true);
    // } else {
    //   cb(new Error("Only image files are allowed!"), false);
    // }

    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
});

export default upload;
