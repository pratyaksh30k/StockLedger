import express from "express";
import Invoice from "../models/invoice.models.js";
import Stock from "../models/stock.models.js";

const router = express.Router();

const getNextInvoiceNumber = async (userId) => {
  try {
    const lastInvoice = await Invoice.findOne({ createdBy: userId }).sort({
      invoiceNo: -1,
    });
    return lastInvoice ? lastInvoice.invoiceNo + 1 : 1;
  } catch (error) {
    console.error("Error fetching last invoice number:", error);
    return 1;
  }
};

router.post("/saveInvoice", async (req, res) => {
  const {
    customerName,
    customerNumber,
    items,
    subTotal,
    gstTotal,
    totalAmount,
    userId,
  } = req.body;

  if (!customerName || !customerNumber || !items || items.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const invoiceNo = await getNextInvoiceNumber(userId);
    const date = new Date();

    const newInvoice = new Invoice({
      invoiceNo,
      customerName,
      customerNumber,
      date,
      items,
      subTotal,
      gstTotal,
      totalAmount,
      createdBy: userId,
    });

    await newInvoice.save();
    res
      .status(200)
      .json({ message: "Invoice saved successfully", invoice: newInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not create invoice.",
      error: error.message,
    });
  }
});

router.get("/getInvoices", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    
    const invoices = await Invoice.find({ createdBy: userId }).sort({
      invoiceNo: -1,
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not retrieve invoices.",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteInvoice = await Invoice.findByIdAndDelete(id);

    if (!deleteInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error. Could not delete invoice.",
        error: error.message,
      });
  }
});

export default router;
