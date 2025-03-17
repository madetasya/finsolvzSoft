// 1. Buat skema Category -> punya kategori dan subkategori
// 2. kalo kategori utama gak punya _id. jika ada, berarti subkategori
// 4. Setiap tipe laporan punya kategori dan subkategori sendiri.
// 5. ada value. kalo parent jadi tambahin sub kategorinya
// 6. Export model

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  reportType: { type: mongoose.Schema.Types.ObjectId, ref: "ReportType", required: true }
});

export default mongoose.model("Category", CategorySchema);
