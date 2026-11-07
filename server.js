
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/status", (req, res) => {
    res.json({
        message: "Memories API is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
