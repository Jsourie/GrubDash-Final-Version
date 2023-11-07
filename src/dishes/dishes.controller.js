const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const notFound = require('../errors/notFound')

function dishExists(req, res, next) {
  const dishId = req.params.dishId; 
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    req.foundDish = foundDish;
    return next();
  }

  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}


function validate(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body
    if (name && description && price && price > 0 && typeof price === 'number' && image_url) {
        return next()
    } else {
        const messageType = 
            !name ? 'name' : 
                !description ? 'description' : 
                    !price || price <= 0 || typeof price !== 'number' ? 'price' : 
                        'image_url'
        next({ status: 400, message: `Dish must include ${messageType}` })
    }
}


function validateDishIdMatch(req, res, next) {
    const { data } = req.body;
    const { dishId } = req.params;

    if (data.id && data.id !== dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${data.id}, Route: ${dishId}.`
        });
    }
    next();
}





// Get List of all dish data
function list(req, res,next) {
  res.json({ data: dishes });
}

// Post New Dish
function create(req, res,next) {
    const { name, description, price, image_url } = req.body.data;
  
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    };
  
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
  

// Get /dishes/:dishId
function read(req, res, next) {
res.json({ data: req.foundDish })
}


// Put /dishes/:dishId
function updateDish(req, res, next) {
    const dishId = req.params.dishId;
  
    res.locals.dishId = dishId;
  
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    res.locals.dish = {
      id: dishId, 
      name,
      description,
      price,
      image_url,
    };
  
    res.json({ data: res.locals.dish });
  }
  


module.exports = {
  list,
  create:[validate,create],
  read:[dishExists,read],
  update:[dishExists,validateDishIdMatch,validate,updateDish],
};