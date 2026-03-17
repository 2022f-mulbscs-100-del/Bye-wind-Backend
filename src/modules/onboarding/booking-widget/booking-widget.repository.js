const { prisma } = require('../../../config');

class BookingWidgetRepository {
  async create(data) { return prisma.bookingWidget.create({ data }); }
  async findById(id) { return prisma.bookingWidget.findUnique({ where: { id } }); }
  async findByRestaurant(restaurantId) { return prisma.bookingWidget.findMany({ where: { restaurantId }, include: { branch: true } }); }
  async findByToken(embedToken) { return prisma.bookingWidget.findUnique({ where: { embedToken } }); }
  async update(id, data) { return prisma.bookingWidget.update({ where: { id }, data }); }
  async delete(id) { return prisma.bookingWidget.delete({ where: { id } }); }
}

module.exports = new BookingWidgetRepository();
