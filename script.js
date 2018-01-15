const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");


const jsonTab = []; //For creating the table

function writeFile(){
  //Write Json file
  fs.writeFile('output.json', JSON.stringfy(jsonTab, null, 4), (err) => {
    console.log("File successfull written!");
  });
}

// The URL of the advance search feature with our keywords

const url = 'http://www.lemonde.fr/recherche/?keywords="Rap+"+"hip-hop"+"hip%20hop"+"rappeur"+"rappeurs"+"raps"+"rappers"&page_num=1&operator=or&exclude_keywords=&qt=recherche_texte_title&author=&period=custom_date&start_day=01&start_month=01&start_year=1970&end_day=20&end_month=09&end_year=2017&sort=asc';

/* The first request call, our goal here is to get the number of results and then
 to calculate the number of pages */

request(url ,(error, response, html) => {

   const $ = cheerio.load(html);

   //Variable which will be use later
   let number;
   let description;
   let data;
   let title;
   let link;

   if(!error){
     $(".bg_gris_clair").filter(() => {
       /* select all the html elements with the class ".bg_gris_clair" (and we already know there is only one )*/
       const data = $(this);
       const str = data.children("strong").text().trim();
       number = parseInt(str.substring(0, str.indexOf("e")).replace(/\s/g, ""), 10);
     });
   }

   let count = 1;

  for (let i = 1; i <= number / 10; i++) {

       const urlPerPage = 'http://www.lemonde.fr/recherche/?keywords="Rap+"+"hip-hop"+"hip%20hop"+"rappeur"+"rappeurs"+"raps"+"rappers"&page_num=' + i + "&operator=or&exclude_keywords=&qt=recherche_texte_title&author=&period=custom_date&start_day=01&start_month=01&start_year=1970&end_day=20&end_month=09&end_year=2017&sort=asc";

       request(urlPerPage , (err, response2, html2) => {

         if(!err){
            const $ = cheerio.load(html2);

            $(".grid_11.omega.resultat").filter(() => {

              const json = {
                  date: "",
                  title: "",
                  description: "",
                  url: ""
              };
              const data = $(this);

              title = data.children("h3").children("a").text().trim();
              link = "http://lemonde.fr" + data.children("h3").children("a").attr("href").trim();
              description = data.children("p").text().trim();
              const dateStr = data.children("span").text();
              date = dateStr.replace(/.+?(?=\d)/, "");

              json.title = title;
              json.url = link;
              json.description = description;
              json.date = date;
              jsonTab.push(json);

            });
         }else if (err) {
           console.log(err);
         }

         count +=1;

         // Write the file once we iterated through all pages
         if(count === parseInt(number / 10 , 10)){
            writeFile();
         }

       });

   }

});
