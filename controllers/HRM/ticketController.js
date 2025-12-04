const Ticket = require("../../models/HRMmodels/ticketModel");

// ✅ Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("createdBy", "name email");
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    res
      .status(200)
      .json({ success: true, message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
