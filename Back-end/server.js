import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import transactionRoutes from "./routes/transactions.js"


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/transactions", transactionRoutes)

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
    res.send("FinBloom API is running...")
})

app.listen(PORT, "0.0.0.0", () => console.log(`server running on port ${PORT}`))