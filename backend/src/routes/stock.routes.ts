import { Router } from "express";
import * as stock from "../controllers/stock.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/search", stock.search);
router.get("/:ticker/quote", stock.getQuote);
router.get("/:ticker/fundamentals", stock.getFundamentals);
router.get("/:ticker/history", stock.getHistory);
router.get("/:ticker/news", stock.getNews);
router.get("/:ticker/predict", stock.getPrediction);
router.get("/:ticker/sentiment", stock.getSentiment);
router.post("/:ticker/history", requireAuth, stock.addSearchHistory);

export default router;
