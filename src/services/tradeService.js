const { query } = require("../db");


async function getTrades(userId) {

    const result =
        await query(
            `
            SELECT *
            FROM trades
            WHERE user_id = $1
            ORDER BY trade_date DESC, created_at DESC
            `,
            [userId]
        );


    return result.rows;

}


async function getTradeById(
    userId,
    tradeId
) {

    const result =
        await query(
            `
            SELECT *
            FROM trades
            WHERE id = $1
            AND user_id = $2
            `,
            [
                tradeId,
                userId
            ]
        );


    return result.rows[0] || null;

}


async function createTrade(
    userId,
    data
) {

    const result =
        await query(
            `
            INSERT INTO trades (

                user_id,
                account_id,

                trade_date,
                entry_time,
                exit_time,

                pair,
                direction,
                session,
                strategy,
                setup,

                htf_bias,
                mtf_structure,
                ltf_confirmation,
                liquidity,
                mss,
                fvg,
                order_block,
                zone,

                entry_price,
                stop_loss,
                take_profit,
                exit_price,

                risk_amount,
                position_size,

                result,
                r_result,
                pnl,

                planned_rr,
                risk_distance,
                reward_distance,

                psychology_before,
                psychology_during,
                psychology_after,

                followed_plan,
                trade_quality,
                mistake,

                entry_reason,
                what_happened,
                what_did_well,
                improvement,
                notes

            )
            VALUES (

                $1,
                $2,

                $3,
                $4,
                $5,

                $6,
                $7,
                $8,
                $9,
                $10,

                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                $17,
                $18,

                $19,
                $20,
                $21,
                $22,

                $23,
                $24,

                $25,
                $26,
                $27,

                $28,
                $29,
                $30,

                $31,
                $32,
                $33,

                $34,
                $35,
                $36,

                $37,
                $38,
                $39,
                $40,
                $41

            )
            RETURNING *
            `,
            [

                userId,
                data.accountId || null,

                data.tradeDate,
                data.entryTime || null,
                data.exitTime || null,

                data.pair,
                data.direction,
                data.session || null,
                data.strategy || null,
                data.setup || null,

                data.htfBias || null,
                data.mtfStructure || null,
                data.ltfConfirmation || null,
                data.liquidity || null,
                data.mss || null,
                data.fvg || null,
                data.orderBlock || null,
                data.zone || null,

                data.entryPrice,
                data.stopLoss,
                data.takeProfit,
                data.exitPrice || null,

                data.riskAmount || null,
                data.positionSize || null,

                data.result || null,
                data.rResult || null,
                data.pnl || null,

                data.plannedRR || null,
                data.riskDistance || null,
                data.rewardDistance || null,

                data.psychologyBefore || null,
                data.psychologyDuring || null,
                data.psychologyAfter || null,

                data.followedPlan || null,
                data.tradeQuality || null,
                data.mistake || null,

                data.entryReason || null,
                data.whatHappened || null,
                data.whatDidWell || null,
                data.improvement || null,
                data.notes || null

            ]
        );


    return result.rows[0];

}


async function deleteTrade(
    userId,
    tradeId
) {

    const result =
        await query(
            `
            DELETE FROM trades
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [
                tradeId,
                userId
            ]
        );


    return result.rowCount > 0;

}


module.exports = {

    getTrades,

    getTradeById,

    createTrade,

    deleteTrade

};
