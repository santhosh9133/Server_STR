const router = require("express").Router();
const controller = require("../../../controllers/HRM/dropdownControllers/assetCategory.controller");

router.post("/", controller.createCategory);
router.get("/", controller.getCategories);
router.put("/:id", controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

module.exports = router;
