
/* Get packages */
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const colors = require('colors');

/* Get functions */


/* Setup server */
const app = express();
const PORT = 8000;

/* Setup scraper variables */
const URL = 'https://www.theguardian.com/international';
const pureURL = 'https://www.theguardian.com';

let articles = [];

const startScraping = async () => {
    axios(URL)
    .then(async (response) => {

        /* Variable storing scrpaed HTML (full, pure html) */
        const pureHTMLdata = response.data;

        /* Load pureHTMLdata with cheerio to $DATA */
        const $DATA = cheerio.load(pureHTMLdata);

        $DATA('.dcr-12ilguo', pureHTMLdata).each(async function () {

            /* Scrape the article link */
            let $articleLink = $DATA(this).find('a').attr('href');
            /* Convert the link to full path for the article */
            $articleLink = pureURL+$articleLink;
            

            /* Scrape the article title */
            let $articleTitle = $DATA(this).find('h3').find('div').text();


            /* Scrape the article topic */
            let $articleTopic = $DATA(this).find('h3').find('span').text();

        });

    })
    .catch(error => {
        console.log(`Error occured: ${error}`)
    });
}

startScraping();

app.listen(PORT, ()=>console.log(`Server is starting on port ${PORT}`))


