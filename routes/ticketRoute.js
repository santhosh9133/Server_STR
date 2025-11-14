const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

// POST - create ticket
router.post("/", ticketController.createTicket);

// GET - all tickets
router.get("/", ticketController.getAllTickets);

// GET - single ticket
router.get("/:id", ticketController.getTicketById);

// PUT - update ticket
router.put("/:id", ticketController.updateTicket);

// DELETE - delete ticket
router.delete("/:id", ticketController.deleteTicket);

module.exports = router;
