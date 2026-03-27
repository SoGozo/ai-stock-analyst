import { Router } from "express";
import * as wl from "../controllers/watchlist.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", wl.getWatchlist);
router.post("/", wl.addTicker);
router.delete("/:ticker", wl.removeTicker);

export default router;
