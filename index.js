const puppeteer = require('puppeteer');
const Sheet = require('./sheet');

// Replace with the target reddit url
const url = 'https://old.reddit.com/r/gamedev/comments/k4k6ej/my_free_tools_for_programmers_that_i_use_in/';  

(async function() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const sheet = new Sheet();
    await sheet.load();

    // create sheet with title
    const title = await page.$eval('.title a', el => el.textContent);
    const sheetIndex = await sheet.addSheet(title.slice(0, 99), ['points', 'text']); 

    // get rid of the cookie button
    await page.waitForTimeout(500);
    let cookieButton = await page.$('.infobar-btn-container');
    await cookieButton.click(); 
    
    // expand all comment threads
    let expandButtons = await page.$$('.morecomments');
    while (expandButtons.length) {
        for (let button of expandButtons) {
            await button.click();
            await page.waitForTimeout(500);
        }
        await page.waitForTimeout(1000);
        expandButtons = await page.$$('morecomments'); 
    }

    // scrape text and points values from the comments
    const comments = await page.$$('.entry');
    const formattedComments = [];
    for (let comment of comments) {
        const points = await comment.$eval('.score', el => el.textContent).catch(err => console.error("no score"))
        const rawText = await comment.$eval('.usertext-body', el => el.textContent).catch(err => console.error('no text'))
        if (points && rawText) {
            const text = rawText.replace(/\n/g, '');
            formattedComments.push({points, text});
        }
    };

    // sort comments by points
    formattedComments.sort((a,b) => {
        const pointsA = Number(a.points.split(' ')[0])
        const pointsB = Number(b.points.split(' ')[0])
        return pointsB - pointsA; 
    })

    // insert into google spreadsheet
    sheet.addRows(formattedComments, sheetIndex);
    await browser.close();
})() 
