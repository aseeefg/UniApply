import Notification from "../models/Notification.js";
import Circular from "../models/Circular.js";

// @route GET /api/notifications/mine
// Returns the logged-in student's unread (and recent read) notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("circular", "programName deadline")
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/notifications/:id/read
// Mark a single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (String(notification.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your notification" });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/notifications/read-all
// Mark all of the current user's notifications as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/circulars/:id/save  (toggle — save or unsave)
// Students save a circular to receive deadline reminders
export const toggleSaveCircular = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: "Circular not found" });

    const userId = req.user._id;
    const alreadySaved = circular.savedBy.some((id) => String(id) === String(userId));

    if (alreadySaved) {
      circular.savedBy = circular.savedBy.filter((id) => String(id) !== String(userId));
    } else {
      circular.savedBy.push(userId);
    }

    await circular.save();
    res.json({ saved: !alreadySaved, savedBy: circular.savedBy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
