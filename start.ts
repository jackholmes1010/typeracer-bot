import puppeteer from "puppeteer"
import dotenv from "dotenv"
dotenv.config()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // prettier-ignore
;(async () => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    try {
        await page.goto("https://play.typeracer.com")

        const enterTypingRaceSelector =
            "a[title='Keyboard shortcut: Ctrl+Alt+I']"

        // Wait for page to load
        await page.waitForSelector(enterTypingRaceSelector)

        const username = process.env.TYPERACER_USERNAME
        const password = process.env.TYPERACER_PASSWORD

        if (username && password) {
            console.log("Logging in")
            await page.click(".gwt-Anchor")
            await page.type("input[name='username']", username, { delay: 20 })
            await page.type("input[name='password']", password, { delay: 20 })
            await page.click('button[class="gwt-Button"]', { delay: 20 })
            await sleep(1000)
        }

        await page.click(enterTypingRaceSelector)
        await page.waitForSelector(".lightLabel")

        // Wait until race is ready to enter
        let ready = await page.$(".lightLabel")
        while (ready !== null) {
            console.log("Waiting for race to start...")
            await sleep(1000)
            ready = await page.$(".lightLabel")
        }

        console.log("Race started")

        const paragraph = (
            await page.$$eval(
                "table.inputPanel tbody tr td table tbody tr td div div",
                divs => divs.map(div => div.textContent),
            )
        )[0]

        // Type paragraph
        for (const letter of paragraph ?? "") {
            await page.keyboard.type(letter)
            await sleep(100)
        }

        await page.waitForNavigation()
    } finally {
        await page.close()
        await browser.close()
    }
})()
