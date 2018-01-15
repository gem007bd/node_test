const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");

// Prepare all the variables needed later
let count = 0;
let timeout = 0;
const id = "myusername";
const mdp = "mypassword";
let obj;

// The URLs we will scrape from
const connexionUrl = "https://secure.lemonde.fr/sfuser/connexion";

// Will write an "output.json" file
function writeFile() {
  fs.writeFile("output.json", JSON.stringify(obj, null, 4), (err) => {
    console.log(
      "File successfully written! - Check your project directory for the output.json file"
    );
  });
}

// creating a clean jar to store the cookies
const j = request.jar();

// First Get Request Call
request(
  {
    url: connexionUrl,
    jar: j
  },
  (err, httpResponse, html) => {
    const $ = cheerio.load(html);

    // We use Cheerio to load the HTML and be able to find the connection__token
    const token = $("#connection__token")[0].attribs.value; // here is the connection__token

    // Construction of the form required in the POST request to login
    const form = {
      "connection[mail]": id,
      "connection[password]": mdp,
      "connection[stay_connected]": 1,
      "connection[save]": "",
      "connection[_token]": token
    };

    // POST REQUEST to Log IN. Same url with "request headers" and the complete form.
    request.post(
      {
        url: connexionUrl,
        jar: j,
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "http://secure.lemonde.fr/",
            Host: "secure.lemonde.fr",
            "Upgrade-Insecure-Requests": 1,
            "User-Agents":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0",
          Connection: "keep-alive",
          Pragma: "no-cache",
          Referer: "https://secure.lemonde.fr/sfuser/connexion"
        },

        form: form
      },
      (error, response, body) => {
        // WE ARE CONNECTED :D

        /* Second GET request call : this time, we use the response of the POST
        request to request the right URL */
        request(
          {
            url: response.headers.location,
            jar: j
          },
          (err, httpResponse, html2) => {
            const json = fs.readFileSync("./firstStep.json"); // Load the JSON created in step one
            obj = JSON.parse(json); // We create our JSON in a usable javascript object

            // forEach loop to iterate through all the object and request each link
            obj.forEach((e) => {
              let articleUrl = e.url;

              /* We use a setTimeout to be sure that all the requests are performed
              one by one and not all at the same time */
              setTimeout(() => {
                request(
                  {
                    url: articleUrl,
                    jar: j
                  },
                  (error1, httpResponse, html3) => {
                    if (!error1) {
                      const $ = cheerio.load(html3); // load the HTML of the article page
                      $(".contenu_article.js_article_body").filter(() => {
                        const data = $(this);

                        // get the content, remove all the new lines (better for Excel)
                        let text = data
                          .text()
                          .trim()
                          .replace(/\n/g, "\t");

                        e.text = text; // push the content in the table
                      });

                      $(".txt3.description-article").filter(() => {
                        const data = $(this);

                        const description = data
                          .text()
                          .trim()
                          .replace(/\n/g, "\t");

                        e.description = description;
                      });
                    }
                  }
                );

                count += 1;

                // Write a new JSON file once we get the content of all the articles
                if (count === obj.length) {
                  writeFile();
                }
              }, timeout);

              timeout += 50; // increase the timeout length each time
            });
          }
        );
      }
    );
  }
);
