const puppeteer = require("puppeteer");
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const indexRoute = require("./routes/indexRoute");

const finnInnUrl = "https://www.finninn.se/lunch-meny/";
const mopUrl = "https://morotenopiskan.se/lunch/";
const brygganUrl = "https://www.bryggancafe.se/";
const hojdpunktenUrl = "http://restauranghojdpunkten.se/meny";
const edisonUrl = "http://restaurangedison.se/lunch";
const inspiraUrl = "https://mediconvillage.se/sv/restaurant-inspira";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Pass json to template
app.use(
  "/home",
  function (req, res, next) {
    req.foodObject = foodObject;
    next();
  },
  indexRoute
);

let foodObject = {};
const noLunchArray = ["-", "-"];

async function init() {
  console.log("Getting menus, this may take a few moments...");
  const date = new Date();
  const day = date.getDay();
  const browser = await puppeteer.launch();
  let finnInnMenu = await getFinnInnMenu();
  let mopMenu = await getMopMenu();
  let brygganMenu = await getBrygganMenu();
  let hojdpunktenMenu = await getHojdpunktenMenu();
  let edisonMenu = await getEdisonMenu();
  let inspiraMenu = await getInspiraMenu();
  await browser.close();
  foodObject = {
    mop: {
      dagens: mopMenu[0],
      veg: mopMenu[1],
    },
    finnInn: {
      dagens: finnInnMenu[0],
      veg: finnInnMenu[1],
    },
    bryggan: {
      dagens: brygganMenu[0],
      veg: brygganMenu[1],
    },
    hojdpunkten: {
      dagens: hojdpunktenMenu[0],
      dagens2: hojdpunktenMenu[1],
    },
    edisonMenu: {
      dagens: edisonMenu[1],
      veg: edisonMenu[0],
    },
    inspira: {
      dagens: inspiraMenu[0],
      veg: inspiraMenu[1],
    },
  };
  console.log("Menus ready to serve!");

  async function getFinnInnMenu() {
    if (day > 5 || day === 0) {
      return ["-", "-", "-"];
    }
    const page = await browser.newPage();
    await page.goto(finnInnUrl);
    //TODO Filter out unnecessary parts of array
    let menu = await page.evaluate(() =>
      [...document.getElementsByTagName("LI")].map(
        (element) => element.innerText
      )
    );
    let finnInnWeekday = day <= 5 ? day + 5 : 0;
    let splitWeekdayMenu = menu[finnInnWeekday].split("\n");
    return [splitWeekdayMenu[3], splitWeekdayMenu[7]];
  }

  async function getMopMenu() {
    const page = await browser.newPage();
    await page.goto(mopUrl);
    let menu = await page.evaluate(() =>
      [...document.querySelectorAll(".event-info")].map(
        (element) => element.innerText
      )
    );
    if (!menu) {
      return noLunchArray;
    }
    let splitMenu = menu[0].split("\n");
    //Position 0 & 4 contain the daily lunches in Swedish
    return [splitMenu[0], splitMenu[4]];
  }

  async function getBrygganMenu() {
    if (day > 5 || day === 0) {
      return noLunchArray;
    }
    const page = await browser.newPage();
    await page.goto(brygganUrl);
    let menu = await page.evaluate(() =>
      [...document.querySelectorAll(".et_pb_text_inner")].map(
        (element) => element.innerText
      )
    );
    let splitMenu = menu[0].split("\n").slice(6);
    const brygganDayArray = ["Måndag:", "Tisdag:", "Onsdag:", "Torsdag:", "Fredag:"];
    let dayIndex = splitMenu.indexOf(brygganDayArray[day - 1]);
    return [splitMenu[dayIndex + 2], splitMenu[dayIndex + 4]];
  }

  async function getHojdpunktenMenu() {
    if (day > 5 || day === 0) {
      return ["-", "-"];
    }
    const page = await browser.newPage();
    await page.goto(hojdpunktenUrl);
    let menu = await page.evaluate(() =>
      [...document.querySelectorAll(".bk-content-text")].map(
        (element) => element.innerText
      )
    );
    let cleanedMenu = menu[1].split("\n").filter((element) => element !== "");
    let dayIndex = cleanedMenu.indexOf(
      cleanedMenu.filter((element) => element.includes(date.getDate()))[0]
    );
    return [
      cleanedMenu[dayIndex + 1].substring(3),
      cleanedMenu[dayIndex + 2].substring(3).includes("2.")
        ? cleanedMenu[dayIndex + 2].substring(3)
        : "-",
    ];
  }

  async function getEdisonMenu() {
    if (day > 5 || day === 0) {
      return noLunchArray;
    }
    const page = await browser.newPage();
    await page.goto(edisonUrl);
    let menu = await page.evaluate(() =>
      [...document.querySelectorAll(".course_description")].map(
        (element) => element.innerText
      )
    );
    let splitMenu = [];
    for (let i = 0; i < menu.length; i++) {
      splitMenu.push(menu[i].split(/\r?\n/).shift());
    }
    const edisonMenuIndex = [0, 3, 6, 9, 12];
    return [splitMenu[edisonMenuIndex[day - 1]], splitMenu[edisonMenuIndex[day - 1] + 1]];
  }

  async function getInspiraMenu() {
    if (day > 5 || day === 0) {
      return ["-", "-"];
    }
    const page = await browser.newPage();
    await page.goto(inspiraUrl);
    let menu = await page.evaluate(() =>
      [...document.querySelectorAll(".owl-item")].map(
        (element) => element.innerText
      )
    );
    let splitMenu = [];
    for (let i = 0; i < menu.length; i++) {
      splitMenu.push(menu[i].split(/\r?\n/));
    }
    let inspiraDagens = splitMenu[day - 1][3];
    let inspiraVeg = splitMenu[day - 1][4];
    return [
      inspiraDagens.substr(
        inspiraDagens.indexOf(" ", inspiraDagens.indexOf(" ") + 1)
      ),
      inspiraVeg.substr(inspiraVeg.indexOf(" ") + 1),
    ];
    //Return menu without spaces.
  }
}

app.listen(
  port,
  '0.0.0.0',
  console.log(`Server listening at: http://192.168.1.59:3000/home`),
  init()
);
