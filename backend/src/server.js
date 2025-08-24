import express from "express";

const app = express();

app.listen(process.env.PORT || 5001, () => console.log("Server running on PORT 5001"))