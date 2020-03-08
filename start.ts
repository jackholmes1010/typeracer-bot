import puppeteer from "puppeteer"

// prettier-ignore
;(async () => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    try {
        await page.goto("https://play.typeracer.com")
        const enterTypingRaceSelector =
            "a[title='Keyboard shortcut: Ctrl+Alt+I']"
        await page.waitForSelector(enterTypingRaceSelector)
        await page.click(enterTypingRaceSelector)
        await page.waitForSelector(".lightLabel")

        // Wait until race is ready to enter
        let ready = await page.$(".lightLabel")
        while (ready !== null) {
            console.log("Waiting for race to start...")
            await new Promise(resolve => setTimeout(resolve, 1000))
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
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        await page.waitForNavigation()
    } finally {
        await page.close()
        await browser.close()
    }
})()
