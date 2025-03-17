// 1. Buat skema ReportType
// 2. bikin pake variabel tipe laporan dengan pilihan tetap (enum), tambah validaisi perlu apa aja
// 3. Export model pake mongoose

import mongoose from "mongoose";

const ReportTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("ReportType", ReportTypeSchema);
