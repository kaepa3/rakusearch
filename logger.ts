import * as log from "https://deno.land/std@0.99.0/log/mod.ts";

// 出力ファイル名
const filename = "./app.log";

// 出力フォーマット
const formatter = "{datetime} {levelName} {msg}";

await log.setup({
  handlers: {
    // console出力形式の定義
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter,
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

// getLogger()を無引数で実行すると"default"のloggerを取得する
const Logger = log.getLogger();
console.log(`logfile: ${filename}`);

export { Logger };
