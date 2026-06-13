const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Car = require('../src/models/Car');
const Booking = require('../src/models/Booking');
const { authenticate, requireAdmin } = require('../src/middleware/auth');
const carController = require('../src/controllers/carController');
const bookingController = require('../src/controllers/bookingController');

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const makeQuery = (results = []) => {
  const query = {
    skipValue: undefined,
    limitValue: undefined,
    populate() {
      return this;
    },
    sort() {
      return this;
    },
    skip(value) {
      this.skipValue = value;
      return this;
    },
    limit(value) {
      this.limitValue = value;
      return Promise.resolve(results);
    },
  };
  return query;
};

test('authenticate verifies Bearer tokens with ROTTO_JWT_SECRET', () => {
  process.env.ROTTO_JWT_SECRET = 'test-secret';
  const token = jwt.sign({ id: 'user-1', role: 'user' }, process.env.ROTTO_JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = makeResponse();
  let called = false;

  authenticate(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.id, 'user-1');
});

test('Booking userId is an ObjectId reference to User', () => {
  const userPath = Booking.schema.path('userId');
  assert.equal(userPath.instance, 'ObjectId');
  assert.equal(userPath.options.ref, 'User');
});

test('getMyBookings starts page one at offset zero', async (t) => {
  const query = makeQuery([{ _id: 'booking-1' }]);
  t.mock.method(Booking, 'find', () => query);
  t.mock.method(Booking, 'countDocuments', async () => 1);
  const req = { user: { id: 'user-1' }, query: {} };
  const res = makeResponse();

  await bookingController.getMyBookings(req, res, assert.fail);

  assert.equal(query.skipValue, 0);
  assert.equal(query.limitValue, 10);
  assert.equal(res.body.meta.page, 1);
});

test('car updates are owner-scoped and cannot change registration number', async (t) => {
  let filter;
  let updates;
  t.mock.method(Car, 'findOneAndUpdate', async (receivedFilter, receivedUpdates) => {
    filter = receivedFilter;
    updates = receivedUpdates;
    return { _id: 'car-1', ...receivedUpdates };
  });
  const req = {
    user: { id: 'user-1' },
    params: { id: 'car-1' },
    body: { make: 'Honda', registrationNumber: 'NEW123' },
  };
  const res = makeResponse();

  await carController.updateCar(req, res, assert.fail);

  assert.deepEqual(filter, { _id: 'car-1', userId: 'user-1' });
  assert.deepEqual(updates, { make: 'Honda' });
});

test('car deletion is blocked while active bookings exist', async (t) => {
  const car = { _id: 'car-1', deleteOne: t.mock.fn() };
  t.mock.method(Car, 'findOne', async () => car);
  t.mock.method(Booking, 'exists', async () => ({ _id: 'booking-1' }));
  const req = { user: { id: 'user-1' }, params: { id: 'car-1' } };
  const res = makeResponse();

  await carController.deleteCar(req, res, assert.fail);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.error.code, 'ACTIVE_BOOKINGS_EXIST');
  assert.equal(car.deleteOne.mock.callCount(), 0);
});

test('booking status updates enforce the transition map', async (t) => {
  const booking = {
    status: 'pending',
    save: t.mock.fn(async () => {}),
    populate: t.mock.fn(async () => {}),
  };
  t.mock.method(Booking, 'findById', async () => booking);
  const req = { params: { id: 'booking-1' }, body: { status: 'completed' } };
  const res = makeResponse();

  await bookingController.updateBookingStatus(req, res, assert.fail);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.error.code, 'INVALID_STATUS_TRANSITION');
  assert.equal(booking.save.mock.callCount(), 0);
});

test('admin booking list applies filters and pagination', async (t) => {
  const query = makeQuery([]);
  let filters;
  t.mock.method(Booking, 'find', (receivedFilters) => {
    filters = receivedFilters;
    return query;
  });
  t.mock.method(Booking, 'countDocuments', async () => 12);
  const req = {
    query: { page: '2', limit: '5', status: 'confirmed', serviceType: 'oil-change' },
  };
  const res = makeResponse();

  await bookingController.getAllBookings(req, res, assert.fail);

  assert.deepEqual(filters, { status: 'confirmed', serviceType: 'oil-change' });
  assert.equal(query.skipValue, 5);
  assert.equal(query.limitValue, 5);
  assert.equal(res.body.meta.totalPages, 3);
});

test('car and booking routes expose protected endpoints', () => {
  const carRoutes = require('../src/routes/cars').stack;
  const bookingRoutes = require('../src/routes/bookings').stack;
  const carMethods = carRoutes
    .filter((layer) => layer.route)
    .flatMap((layer) => Object.keys(layer.route.methods));
  const bookingMethods = bookingRoutes
    .filter((layer) => layer.route)
    .flatMap((layer) => Object.keys(layer.route.methods));

  assert.deepEqual(carMethods.sort(), ['delete', 'get', 'get', 'post', 'put']);
  assert.deepEqual(bookingMethods.sort(), ['get', 'get', 'post', 'put']);
  assert.ok(carRoutes.some((layer) => layer.handle === authenticate));
  assert.ok(
    bookingRoutes.some(
      (layer) => layer.route && layer.route.stack.some((handler) => handler.handle === requireAdmin)
    )
  );
});

test.after(async () => {
  await mongoose.disconnect();
});
