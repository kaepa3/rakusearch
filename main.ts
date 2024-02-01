import puppeteer, {
  ElementHandle,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { Logger } from "./logger.ts";
import math from "https://deno.land/x/math@v1.1.0/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
function init() {
  const rakuten_mail: string = Deno.env.get("RAKUTEN_MAIL")!;
  const rakuten_pass: string = Deno.env.get("RAKUTEN_PASS")!;

  if (rakuten_pass == undefined || rakuten_mail == undefined) {
    return false;
  }
  return [rakuten_mail, rakuten_pass];
}

async function login(page: Page, mail: string, pass: string) {
  page.goto(
    "https://login.account.rakuten.com/sso/authorize?client_id=rakuten_web_search_web&redirect_uri=https://websearch.rakuten.co.jp/rtoken_login?tool_id=1&scope=openid&response_type=code&state=any-string-to-keep-state#/sign_in"
  );
  await page.waitForNavigation();
  await page.waitForSelector("input.wf");
  await page.type("#user_id", mail);
  await page.click("#cta001");
  //
  await page.waitForNavigation();
  await page.waitForSelector("input.wf");
  await page.type("#password_current", pass);
  await page.click("#cta011");
  await page.waitForNavigation();
}

function getRandomInt() {
  const min = Math.ceil(1);
  const max = Math.floor(5);
  return Math.floor(Math.random() * (max - min) + min);
}

async function search(page: Page, words: string[]) {
  await page.waitForNavigation();
  await page.waitForSelector("input.sc-eDvSVe");
  for (const line of words) {
    for (const w of line.split("•")) {
      await page
        .waitForSelector("#search-input", {
          visible: true,
          timeout: 5000,
        })
        .then(async () => {
          Logger.info("first:" + w);
          await page.type("#search-input", w);
          await page.click("#search-submit");
        })
        .catch(async () => {
          Logger.info("try:" + w);
          await page.$eval(
            "#srchformtxt_qt",
            (element) => (element.value = "")
          );
          await page.type("#srchformtxt_qt", w);
          await page.click("#searchBtn");
        });
      const time = getRandomInt();
      await sleep(time * 1000);
    }
  }
}
async function hoge(d: ElementHandle): Promise<string> {
  const value = await (await d.getProperty("textContent")).jsonValue();
  return value.replace(/\s+/g, "");
}

async function getWords(page: Page) {
  await page.goto(
    "https://trends.google.co.jp/trends/trendingsearches/realtime?geo=JP&hl=ja&category=all"
  );
  await page.waitForSelector("div.feed-item");
  const details = await page.$$("div.title");
  const map: string[] = [];
  details.map(async function (x) {
    map.push(await hoge(x));
  });
  return map;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const result = init();
  if (result == false) {
    Logger.error("init error");
  } else {
    const launch_opt = {
      headless: false,
      channel: "chrome",
      args: ["--lang=ja,en-US,en"], // デフォルトでは言語設定が英語なので日本語に変更
    };
    const browser = await puppeteer.launch(launch_opt);
    const page = await browser.newPage();
    await page.emulate(puppeteer.devices["iPhone SE"]);
    await getWords(page).then(function (words) {
      Logger.info(typeof words);
      Logger.info("====================");
      login(page, result[0], result[1]).then(function () {
        search(page, words).then(function () {
          browser.close();
        });
      });
    });
  }
}
