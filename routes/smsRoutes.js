// routes/smsRoutes.js
import express from "express";
import {
  fetchTransactions,
  sendBulkSMS,
  sendSingleSMS,
  sendTestSMS,
} from "../services/sms.service.js";

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
    const response = await sendBulkSMS(transactionIds);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/test", async (req, res) => {
  try {
    const { number, message } = req.body;
    const response = await sendTestSMS(number, message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
