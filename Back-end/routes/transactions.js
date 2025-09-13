import express from "express"
import pool from "../db.js"

const router = express.Router()

router.get("/", async(req, res) => {
    try{
        const result = await pool.query(
             "SELECT id, type, category, amount, description, created_at FROM transactions ORDER BY created_at DESC"
        )
        res.json(result.rows)
    } catch(err) {
        console.error("GET /api/transactions error:", err);
        res.status(500).json({error: err.message})
    }
})

router.post("/", async (req, res) => {
    try {
        const {type, category, amount, description} = req.body
        const result = await pool.query(
            `INSERT INTO transactions (type, category, amount, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id, type, category, description, amount, created_at`,
            [type, category, amount, description]
        )

        res.json(result.rows[0])
        res.status(201).json({
            ...row,
            date: row.created_at
        })
    } catch (err){
        console.error("POST /api/transactions error:", err);
        res.status(500).json({error: err.message})
    }
})

export default router