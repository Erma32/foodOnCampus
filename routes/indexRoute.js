const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  const date = new Date();
  let foodObject = req.foodObject;
  res.render("index", {
    title: "Food On Campus",
    date: `${date.getDate()}/${date.getMonth()}`,
    weekend: foodObject.weekend,
    mopDagens: foodObject.mop.dagens,
    mopVeg: foodObject.mop.veg,
    finnDagens: foodObject.finnInn.dagens,
    finnVeg: foodObject.finnInn.veg,
    brygganDagens: foodObject.bryggan.dagens,
    brygganVeg: foodObject.bryggan.veg,
    hojdpunktenDagens: foodObject.hojdpunkten.dagens,
    hojdpunktenDagens2: foodObject.hojdpunkten.dagens2,
    edisonDagens: foodObject.edisonMenu.dagens,
    edisonVeg: foodObject.edisonMenu.veg,
    inspiraDagens: foodObject.inspira.dagens,
    inspiraVeg: foodObject.inspira.veg,
    linnersDagens: foodObject.linners.dagens,
    linnersVeg: foodObject.linners.veg,
    spillDagens: foodObject.spill.dagens,
    spillVeg: foodObject.spill.veg,
    finnUtDagens: foodObject.finnUt.dagens,
    finnUtVeg: foodObject.finnUt.veg,
  });
});

module.exports = router;
