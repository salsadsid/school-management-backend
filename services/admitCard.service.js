import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path, { dirname } from "path";
import { PDFDocument, rgb } from "pdf-lib";
import "regenerator-runtime/runtime.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const toBengaliDigits = (number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return number.toString().replace(/\d/g, (digit) => bengaliDigits[digit]);
};

const validateCoordinates = (x, y) => {
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error(`Invalid coordinates (x: ${x}, y: ${y})`);
  }
};

export const generateClassAdmitCards = async (students, examName, classId) => {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Font Loading
    const fontPath = path.join(__dirname, "assets", "kalpurush.ttf");
    if (!fs.existsSync(fontPath)) throw new Error(`Font missing: ${fontPath}`);
    const banglaFontBytes = fs.readFileSync(fontPath);
    const banglaFont = await pdfDoc.embedFont(banglaFontBytes, {
      subset: true,
    });

    // Image Handling
    const logoBytes = fs.readFileSync(
      path.join(__dirname, "assets", "logo.png")
    );
    const logoImg = await pdfDoc.embedPng(logoBytes);

    // Date Formatting
    const now = new Date();
    const bengaliDate = [
      toBengaliDigits(now.getDate()),
      toBengaliDigits(now.getMonth() + 1),
      toBengaliDigits(now.getFullYear()),
    ].join("/");

    // Page Configuration
    const A4 = [595.28, 841.89];
    const startYs = [790, 530, 270];
    const cardHeight = 250;
    const cardWidth = 495;
    const leftMargin = 50;

    const instructions = [
      "১. পরীক্ষার সময়ের কমপক্ষে ১৫ মিনিট পূর্বে কেন্দ্রে উপস্থিত হতে হবে।",
      "২. প্রবেশপত্র ছাড়া পরীক্ষায় অংশগ্রহণ করা যাবে না।",
      "৩. নিজের কলম, পেন্সিল, জ্যামিতি বক্স সঙ্গে আনতে হবে।",
      "৪. অসদুপায় অবলম্বন করলে পরীক্ষা বাতিল হবে।",
    ];

    const safeDrawText = (page, text, x, y, options = {}) => {
      validateCoordinates(x, y);
      page.drawText(text, { x, y, font: banglaFont, ...options });
    };

    for (let i = 0; i < students.length; i += 3) {
      const page = pdfDoc.addPage(A4);
      const group = students.slice(i, i + 3);

      for (let j = 0; j < group.length; j++) {
        const student = group[j];
        const yPos = startYs[j];
        // Load student image
        let studentImage;
        if (student.imageCloudinary || student.imageLocal) {
          try {
            let imageBytes;
            if (student.imageCloudinary) {
              const response = await fetch(student.imageCloudinary);
              imageBytes = await response.arrayBuffer();
            } else {
              imageBytes = fs.readFileSync(student.imageLocal);
            }

            // Try embedding as JPG or PNG
            try {
              studentImage = await pdfDoc.embedJpg(imageBytes);
            } catch (e) {
              studentImage = await pdfDoc.embedPng(imageBytes);
            }
          } catch (err) {
            console.error("Error loading student image:", err);
          }
        }
        // Card Container
        page.drawRectangle({
          x: leftMargin,
          y: yPos - cardHeight,
          width: cardWidth,
          height: cardHeight,
          borderColor: rgb(0.2, 0.4, 0.6),
          borderWidth: 1.5,
          color: rgb(0.98, 0.98, 0.98),
        });

        // Header Section
        page.drawRectangle({
          x: leftMargin,
          y: yPos - 65,
          width: cardWidth,
          height: 65,
          color: rgb(0.8, 0.9, 1),
        });

        // Institution Info
        safeDrawText(page, "H.A.K Academy", leftMargin + 70, yPos - 30, {
          size: 16,
          fontWeight: "bold",
          color: rgb(0.1, 0.3, 0.6),
        });

        safeDrawText(
          page,
          "College Road, Joina Bazar, Sreepur, Gazipur.",
          leftMargin + 70,
          yPos - 50,
          { size: 10, color: rgb(0.2, 0.2, 0.2) }
        );

        // Logo
        page.drawImage(logoImg, {
          x: leftMargin + 10,
          y: yPos - 60,
          width: 50,
          height: 50,
        });

        // Student Image (right side of header)
        if (studentImage) {
          page.drawRectangle({
            x: leftMargin + cardWidth - 80,
            y: yPos - 80,
            width: 70,
            height: 70,
            borderColor: rgb(0.2, 0.4, 0.6),
            borderWidth: 5,
            color: rgb(0.98, 0.98, 0.98), // Background color
          });

          // Then draw the image on top
          page.drawImage(studentImage, {
            x: leftMargin + cardWidth - 80,
            y: yPos - 80,
            width: 70,
            height: 70,
          });
        }
        // Student Information
        const studentInfo = [
          ["পরীক্ষার নাম:", examName],
          ["নাম:", student.name],
          ["আইডি:", student.studentId],
          ["শ্রেণি:", classId ? classId.split(" ")[1] : ".................."],
          ["রোল:", ".................."],
        ];

        studentInfo.forEach(([label, value], index) => {
          const yOffset = yPos - 90 - index * 16;
          safeDrawText(page, label, leftMargin + 10, yOffset, {
            size: 10,
            color: rgb(0.3, 0.3, 0.6),
          });
          safeDrawText(page, value, leftMargin + 100, yOffset, {
            size: 10,
            color: rgb(0, 0, 0),
          });
        });

        // Instructions Section
        const instructionsStartY = yPos - 180;

        instructions.forEach((instruction, idx) => {
          safeDrawText(
            page,
            `• ${instruction}`,
            leftMargin + 10,
            instructionsStartY - idx * 16,
            {
              size: 9,
              lineHeight: 12,
              color: rgb(0.5, 0.2, 0.2),
            }
          );
        });

        // Authority Section
        const authorityY = yPos - cardHeight + 40;
        safeDrawText(
          page,
          "প্রধান শিক্ষক",
          leftMargin + cardWidth - 100,
          authorityY,
          { size: 10, color: rgb(0.3, 0.3, 0.3) }
        );
        safeDrawText(
          page,
          `তারিখ: ${bengaliDate}`,
          leftMargin + cardWidth - 100,
          authorityY - 15,
          { size: 10, color: rgb(0.3, 0.3, 0.3) }
        );
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error(`Failed to generate admit cards: ${error.message}`);
  }
};
