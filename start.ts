import puppeteer from "puppeteer"
import dotenv from "dotenv"
dotenv.config()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // prettier-ignore
;(async () => {
    const enterTypingRaceSelector = "a[title='Keyboard shortcut: Ctrl+Alt+I']"
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    try {
        console.log("> Loading play.typeracer.com")
        await page.goto("https://play.typeracer.com")
        await page.waitForSelector(enterTypingRaceSelector)

        const username = process.env.TYPERACER_USERNAME
        const password = process.env.TYPERACER_PASSWORD

        // Login in to typeracer account
        if (username && password) {
            console.log("> Logging in")
            await page.click(".gwt-Anchor")
            await page.type("input[name='username']", username, { delay: 20 })
            await page.type("input[name='password']", password, { delay: 20 })
            await page.click('button[class="gwt-Button"]', { delay: 20 })
            await sleep(1000)
            console.log("> Login successful")
        }

        await page.click(enterTypingRaceSelector)
        await page.waitForSelector(".lightLabel")

        // Wait until race is ready to enter
        let ready = await page.$(".lightLabel")

        while (ready !== null) {
            console.log("> Waiting for race to start...")
            await sleep(1000)
            ready = await page.$(".lightLabel")
        }

        console.log("> Race started")

        // Extract paragraph content
        const paragraph = (
            await page.$$eval(
                "table.inputPanel tbody tr td table tbody tr td div div",
                divs => divs.map(div => div.textContent),
            )
        )[0]

        console.log("\n~*==>")

        // Start typing paragraph
        for (const letter of paragraph ?? "") {
            await page.keyboard.type(letter)
            process.stdout.write(letter)
            await sleep(100)
        }

        console.log("\n~*==>\n")
        console.log("> Race completed.")

        await sleep(5000)
    } finally {
        await page.close()
        await browser.close()
    }
})()
