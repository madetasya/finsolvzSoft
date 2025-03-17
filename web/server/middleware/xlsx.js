import multer from "multer";
import xlsx from "xlsx";

const upload = multer({ dest: "uploads/" });

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
};

export { upload, parseExcel };
