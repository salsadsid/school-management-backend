// routes/smsRoutes.js
import express from "express";
import {
  fetchTransactions,
  previewBulkSMS,
  sendBulkSMS,
  sendMultiSMS,
  sendSingleSMS,
  sendTestSMS,
} from "../services/sms.service.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.get("/transactions", async (req, res) => {
  try {
    const transactions = await fetchTransactions(
      req.query.start_time,
      req.query.end_time,
      req.query.page_size
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-single", async (req, res) => {
  try {
    const { transactionId } = req.body;
    const response = await sendSingleSMS(transactionId);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-bulk", async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const report = await sendBulkSMS(transactionIds);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      report: error.report, // Optional: Add error reporting
    });
  }
});

router.get("/preview", async (req, res) => {
  try {
    const report = await previewBulkSMS();
    res.json(report);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      report: error.report, // Optional: Add error reporting
    });
  }
});

router.post("/test", async (req, res) => {
  try {
    const { number, message } = req.body;
    const report = await sendTestSMS(number, message);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      report: error.report,
    });
  }
});

router.post("/send-multi", tokenVerification, async (req, res) => {
  try {
    const { classIds, message, isTest } = req.body;
    const report = await sendMultiSMS(classIds, message, isTest);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      report: error.report,
    });
  }
});

export default router;
