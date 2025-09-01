import express from "express";
import Stock from "../models/stock.models.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/addStock", verifyToken, async (req, res) => {
  try {
    const { productName, purchasingPrice, sellingPrice, quantity, type } =
      req.body;
    if (
      !productName ||
      !purchasingPrice ||
      !sellingPrice ||
      !quantity ||
      !type
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const stock = new Stock({
      productName,
      purchasingPrice,
      sellingPrice,
      quantity,
      type,
      user: req.user.id,
    });

    await stock.save();
    res.status(201).json({ message: "Stock added successfully", stock });
  } catch (error) {
    res.status(500).json({ message: "Error adding stock", error: err.message });
  }
});

router.put("/editStock/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock not found or unauthorized" });
    }
    res.status(200).json({ message: "Stock updated successfully", stock });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating stock", error: err.message });
  }
});

router.get("/getStocks", verifyToken, async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(stocks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching stocks", error: err.message });
  }
});

router.delete("/deleteStock/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findOneAndDelete({ _id: id, user: req.user.id });

    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock not found or unauthorized" });
    }

    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting stock", error: err.message });
  }
});

export default router;
