import express from "express";
const router = express.Router();
// import categoryController from "../controllers/categoryController.js";
import reportController from "../controllers/reportController.js";
import userController from "../controllers/userController.js";
import companyController from "../controllers/companyController.js";
import reportTypeController from "../controllers/reportTypeController.js";
import { authorization, registerUser } from "../middleware/authorization.js";
import authentication from "../middleware/authentication.js";
import multer from "../middleware/multer.js";

// USER ROUTES
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/login", userController.login);
router.get("/users", userController.getUsers);

router.use(authentication);
router.post("/register", userController.register);
router.post("/logout", userController.logout);
router.patch("/change-password", userController.changePassword);
router.get("/loginUser", userController.getLoginUser);
router.put("/updateRole", userController.updateRole);
router.put("/updateUser/:id", userController.updateUser);
router.get("/users/:name", userController.getUserByName);
router.get("/users/:id", userController.getUserById);
router.delete("/users/:id", userController.deleteUser);


// REPORT ROUTES
// router.post("/reports/import", multer.single("file"), reportController.importExcelReport);
router.post("/reports", reportController.createReport);
router.put("/reports/:id", reportController.updateReport);
router.delete("/reports/:id", reportController.deleteReport);

router.get("/reports", reportController.getAllReports);
router.get("/reports/:id", reportController.getReportById);
router.get("/reports/name/:name", reportController.getReportByName);
router.get("/reports/company/:companyId", reportController.getReportByCompany);
router.post("/reports/companies", reportController.getReportsByCompanies);

router.get("/reports/reportType/:reportType", reportController.getReportByReportType);
router.get("/reports/userAccess/:id", reportController.getReportByUserAccess);
router.get("/reports/createdBy/:id", reportController.getReportByCreatedBy);

// REPORT TYPE ROUTES
router.get("/reportTypes", reportTypeController.getReportTypes);
router.get("/reportTypes/:id", reportTypeController.getReportTypeById);
router.get("/reportTypes/:name", reportTypeController.getReportTypeByName);
router.post("/reportTypes", reportTypeController.addReportType);
router.put("/reportTypes/:id", reportTypeController.updateReportType);
router.delete("/reportTypes/:id", reportTypeController.deleteReportType);

// COMPANY ROUTES
router.get("/company", companyController.getCompanies);
router.post("/company", companyController.createCompany);
router.get("/user/companies", authentication, companyController.getUserCompanies);
router.get("/company/:name", companyController.getCompanyByName);
router.get("/company/:id", companyController.getCompanyById);
router.put("/company/:id", companyController.updateCompany);
router.delete("/company/:id", companyController.deleteCompany);

export default router;
