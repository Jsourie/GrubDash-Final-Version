const router = require("express").Router();

const controller = require("./orders.controller");
const ordersRouter = require("../dishes/dishes.router");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound")

// TODO: Implement the /orders routes needed to make the tests pass


router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed); 

router
  .route("/")
  .get(controller.orderList)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
