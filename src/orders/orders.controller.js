const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    req.foundOrder = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function postValidation(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes = [] } = {} } = req.body;

  if (!deliverTo || !mobileNumber || !Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include a deliverTo, mobileNumber, and at least one dish",
    });
  }

  for (let index = 0; index < dishes.length; index++) {
    const dish = dishes[index];
    if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== 'number') {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  res.locals.create = req.body.data;
  next();
}

function updateValidation(req, res, next) {
  const { data } = req.body;
  const { orderId } = req.params;

  if (data.id && data.id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${data.id}, Route: ${orderId}.`,
    });
  } else if (data.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else if (["pending", "preparing", "out-for-delivery", "delivered"].includes(data.status)) {
    data.id = orderId;
    res.locals.update = data;
    next();
  } else {
    next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
}

function orderList(req, res, next) {
  res.json({ data: orders });
}

function createOrder(req, res, next) {
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({ data: req.foundOrder });
}

function update(req, res, next) {
  res.json({ data: res.locals.update });
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;
  const index = orders.findIndex((order) => order.id === orderId);

  if (index !== -1) {
    const orderToDelete = orders[index];

    if (orderToDelete.status === "pending") {
      orders.splice(index, 1);
      res.sendStatus(204);
    } else {
      next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
      });
    }
  } else {
    next({
      status: 404,
      message: `Order with ID ${orderId} not found`,
    });
  }
}

module.exports = {
  orderList,
  create: [postValidation, createOrder],
  read: [orderExists, read],
  update: [orderExists, postValidation, updateValidation, update],
  delete: [orderExists, destroy],
};

  