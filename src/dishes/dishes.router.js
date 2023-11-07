const router = require("express").Router();

const controller = require("./dishes.controller");
const ordersRouter = require("../orders/orders.router");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound")


router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .delete(methodNotAllowed); 

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;










