const express = require("express");

const authenticate =
    require("../middleware/auth");

const {
    getTrades,
    getTradeById,
    createTrade,
    deleteTrade
} =
    require("../services/tradeService");


const router =
    express.Router();


router.use(authenticate);


/* =========================================================
   GET ALL TRADES
   ========================================================= */

router.get("/", async (req, res) => {

    try {

        const trades =
            await getTrades(
                req.user.id
            );


        res.json({
            trades
        });

    } catch (error) {

        console.error(
            "Get trades error:",
            error
        );


        res.status(500).json({
            error: "Unable to retrieve trades"
        });

    }

});


/* =========================================================
   GET SINGLE TRADE
   ========================================================= */

router.get("/:id", async (req, res) => {

    try {

        const trade =
            await getTradeById(
                req.user.id,
                req.params.id
            );


        if (!trade) {

            return res.status(404).json({
                error: "Trade not found"
            });

        }


        res.json({
            trade
        });

    } catch (error) {

        console.error(
            "Get trade error:",
            error
        );


        res.status(500).json({
            error: "Unable to retrieve trade"
        });

    }

});


/* =========================================================
   CREATE TRADE
   ========================================================= */

router.post("/", async (req, res) => {

    try {

        const data =
            req.body;


        if (!data.tradeDate) {

            return res.status(400).json({
                error: "Trade date is required"
            });

        }


        if (!data.pair) {

            return res.status(400).json({
                error: "Pair is required"
            });

        }


        if (!["Buy", "Sell"].includes(data.direction)) {

            return res.status(400).json({
                error: "Direction must be Buy or Sell"
            });

        }


        const entryPrice =
            Number(data.entryPrice);

        const stopLoss =
            Number(data.stopLoss);

        const takeProfit =
            Number(data.takeProfit);


        if (
            !Number.isFinite(entryPrice) ||
            entryPrice <= 0
        ) {

            return res.status(400).json({
                error: "Invalid entry price"
            });

        }


        if (
            !Number.isFinite(stopLoss) ||
            stopLoss <= 0
        ) {

            return res.status(400).json({
                error: "Invalid stop loss"
            });

        }


        if (
            !Number.isFinite(takeProfit) ||
            takeProfit <= 0
        ) {

            return res.status(400).json({
                error: "Invalid take profit"
            });

        }


        let riskDistance;

        let rewardDistance;


        if (data.direction === "Buy") {

            riskDistance =
                entryPrice - stopLoss;

            rewardDistance =
                takeProfit - entryPrice;

        } else {

            riskDistance =
                stopLoss - entryPrice;

            rewardDistance =
                entryPrice - takeProfit;

        }


        if (
            riskDistance <= 0 ||
            rewardDistance <= 0
        ) {

            return res.status(400).json({
                error:
                    "Stop loss and take profit do not match the trade direction"
            });

        }


        const plannedRR =
            rewardDistance /
            riskDistance;


        const trade =
            await createTrade(
                req.user.id,
                {
                    ...data,

                    entryPrice,

                    stopLoss,

                    takeProfit,

                    riskDistance,

                    rewardDistance,

                    plannedRR
                }
            );


        res.status(201).json({
            trade
        });

    } catch (error) {

        console.error(
            "Create trade error:",
            error
        );


        res.status(500).json({
            error: "Unable to create trade"
        });

    }

});


/* =========================================================
   DELETE TRADE
   ========================================================= */

router.delete("/:id", async (req, res) => {

    try {

        const deleted =
            await deleteTrade(
                req.user.id,
                req.params.id
            );


        if (!deleted) {

            return res.status(404).json({
                error: "Trade not found"
            });

        }


        res.json({
            message: "Trade deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete trade error:",
            error
        );


        res.status(500).json({
            error: "Unable to delete trade"
        });

    }

});


module.exports = router;
