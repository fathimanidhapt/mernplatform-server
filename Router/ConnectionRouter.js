const express = require("express");
const protect = require("../Middleware/authMiddleware");
const {
    sendConnectionRequest,
    respondToConnectionRequest,
    getConnections,
    getPendingRequests,
    getConnectableUsers,
    getSentRequests,
    cancelConnectionRequest
} = require("../Controller/Connectioncontroller");

const router = express.Router();

router.get("/", protect, getConnections);
router.get("/pending", protect, getPendingRequests);
router.get("/sent", protect, getSentRequests);
router.get("/suggestions", protect, getConnectableUsers);
router.post("/request/:id", protect, sendConnectionRequest);
router.put("/respond/:id", protect, respondToConnectionRequest);
router.delete("/request/:id", protect, cancelConnectionRequest);

module.exports = router;
