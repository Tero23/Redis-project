const router = require("express").Router();
const messageController = require("../controllers/message");

router.route("/push").post(messageController.addMessage);
router.route("/pull").get(messageController.getAllAvailableMessages);
router.route("/count").get(messageController.getCount);

module.exports = router;
