import axios from "axios";
import Student from "../models/Student.js";

class BioTimeService {
  async getPhoneNumbersByTimeRange(startTime, endTime) {
    try {
      // 1. Get BioTime transactions
      const bioTimeResponse = await axios.get(
        "http://173.249.28.63/iclock/api/transactions/",
        {
          params: {
            start_time: startTime,
            end_time: endTime,
            page_size: 200,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${process.env.BIOTIME_API_TOKEN}`,
          },
        }
      );

      // 2. Handle BioTime API errors
      if (bioTimeResponse.data.code !== 0) {
        throw new Error(`BioTime API Error: ${bioTimeResponse.data.msg}`);
      }

      // 3. Extract unique employee codes
      const transactions = bioTimeResponse.data.data;
      const empCodes = [
        ...new Set(transactions.map((t) => Number(t.emp_code))),
      ];
      // 4. Find matching students
      const students = await Student.find({
        studentId: { $in: empCodes },
      });

      // 5. Extract and deduplicate phone numbers
      return students
        .map((s) => s.phoneNumber1)
        .filter((phone) => phone && phone.trim() !== "");
    } catch (error) {
      console.error("BioTimeService Error:", error);
      throw new Error(error.message || "Failed to fetch phone numbers");
    }
  }
}

export default new BioTimeService();
