// Get the packages
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const {writeFile, readFile} = require('fs').promises;

// Define app and set the server PORT
const app = express();
const PORT = 8000;

// Define URL
const URL = 'https://www.theguardian.com/international';
const URLstart = "https://www.theguardian.com";

const articles = []
const updatedArticles = []

const checkTheLastID = async () =>{
    const jsonFilePath = './data.json'

    await writeFile(
        jsonFilePath,
        '', 
        //{ flag: 'a' } // Not working as intended
        // Currently it just wipes out whole data.json
    )

    let localLastID;
    
    try{
        const $DATA = await readFile(jsonFilePath, 'utf8');

        if($DATA.trim() === ''){
            return localLastID = 1;
        }

        const jsonArray = JSON.parse($DATA);

        if(jsonArray.length === 0){
            return 1;
        } else {
            localLastID = jsonArray.length + 1;
        }

        return localLastID;
    } catch (err){
        console.log(err)
        return;
    }
}


const saveJson = async (array, path) => {
    try{
        // Change the articles array of objects into JSON file
        const jsonArray = JSON.stringify(array, null, 2);

        await writeFile(
            path,
            jsonArray, 
            { flag: 'a' }
        )

    } catch(err){
        console.log(`Error occured: ${err}`)
    }
    console.log(`\x1b[42mSaving scraped data into JSON file path:\x1b[0m \x1b[33m${path}\x1b[0m \x1b[42mcompleted\x1b[0m`)
    server.close(()=>console.log("Server closed"))
    //checkForDuplicats();

}

async function fetchPhotoLinksForNullObjects(objectsWithNullPhotoLink) {
    const path = __dirname+"/data.json";
    for (const obj of objectsWithNullPhotoLink) {
        try {
            const response = await axios(obj.articleLink);
            const subHTML = response.data;
            const $IMG = cheerio.load(subHTML);

            $IMG('.dcr-6ufhd0', subHTML).each(function () {
                // Get the photo form the subpage
                articlePhotoLink = obj.articlePhotoLink = $IMG(this).find('div').find('picture').find('img').attr('src');

                ID = obj.ID
                articleLink = obj.articleLink
                titleUnderline = obj.titleUnderline
                titleHeader = obj.titleHeader

                updatedArticles.push({
                    ID,
                    articleLink,
                    titleHeader,
                    titleUnderline,
                    articlePhotoLink
                })
            });
            

            console.log(`\x1b[46m\x1b[36mUpdated articlePhotoLink for\x1b[0m \x1b[36m${obj.articleLink}\x1b[0m`);
        } catch (err) {
            console.error(`Error fetching photo link for ${obj.articleLink}: ${err.message}`);
        }
    }

    
    for(const obj of updatedArticles){
        articles[obj.ID - 1] = obj
    }
    console.log("\x1b[32mArticles updated\x1b[0m")

    // Save scraped data to Json file
    await saveJson(articles, path);
    

}

async function startScraping() {
    axios(URL)
    .then(async (response) => {
        const path = __dirname+"/data.json";

        const html = response.data

        const $ = cheerio.load(html)

        let lastID = await checkTheLastID();

        let ID = lastID;

        $('.dcr-12ilguo', html).each(async function(){
            // Get the article link
            const link = $(this).find('a').attr('href')
            const articleLink = URLstart+link;

            // Get the article title header
            const titleHeader = $(this).find('h3').find('div').text()

            // Get the article title underline
            const titleUnderline = $(this).find('h3').find('span').text()

            // Get the article photo
            let articlePhotoLink = $(this).find('img').attr('src')

            // If photo not found, search for it
            
            if(articlePhotoLink === undefined){
                articlePhotoLink = null;
            }

            // Push the data to articles array as objects
            articles.push({
                ID,
                articleLink,
                titleHeader,
                titleUnderline,
                articlePhotoLink
            })
            ID++;
            
        })
        const numberOfArticles = articles.length;
        console.log(`\x1b[32m${numberOfArticles} articles scraped of \x1b[33m${URL}\x1b[0m\x1b[32m and saved to \x1b[0m\x1b[33m${path}\x1b[0m`)
        
        const objectsWithNullPhotoLink = articles.filter(obj => obj.articlePhotoLink === null);
        await fetchPhotoLinksForNullObjects(objectsWithNullPhotoLink);

    }).catch(err => console.log(`\x1b[31mError encountered: ${err}\x1b[0m`))
}

startScraping();

// Setup app to listen on the specified PORT
const server = app.listen(PORT, () => console.log(`\x1b[35mServer is listening on PORT: ${PORT}\x1b[0m`));
