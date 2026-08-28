import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public")
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + filename)
  }
})

export const upload = multer({ storage: storage, limits : {fileSize:5*1024*1024} })  // 5 MB limit