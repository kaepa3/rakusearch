build: main.ts
	PUPPETEER_PRODUCT=chrome deno compile -A --unstable $?

run: main.ts
	PUPPETEER_PRODUCT=chrome deno run -A --unstable $?
