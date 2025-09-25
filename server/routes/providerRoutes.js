const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require provider authentication
router.use(protect);
router.use(restrictTo('provider'));

// Dashboard routes
router.get('/dashboard', providerController.getDashboard);
router.get('/stats', providerController.getStats);

// Service management routes
router.route('/services')
  .get(providerController.getServices)
  .post(providerController.createService);

router.route('/services/:id')
  .put(providerController.updateService)
  .delete(providerController.deleteService);

router.patch('/services/:id/toggle', providerController.toggleServiceStatus);

// Message routes
router.route('/messages')
  .get(providerController.getMessages)
  .post(providerController.sendMessage);

router.route('/messages/:customerId')
  .get(providerController.getConversation);

router.patch('/messages/:customerId/read', providerController.markMessagesRead);

// Schedule and booking routes
router.get('/schedule', providerController.getSchedule);
router.post('/schedule/availability', providerController.updateAvailability);
router.get('/availability', providerController.getAvailability);
router.post('/timeslots/bulk', providerController.bulkTimeSlotUpdate);
router.get('/bookings', providerController.getBookings);
router.patch('/bookings/:id', providerController.updateBookingStatus);

// Reports routes
router.get('/reports', providerController.getReports);
router.get('/reports/earnings', providerController.getEarningsReport);
router.get('/reports/performance', providerController.getPerformanceReport);
router.get('/reports/customers', providerController.getCustomerReport);

module.exports = router;
