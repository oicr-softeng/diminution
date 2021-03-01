import express from 'express';
import {
    cleanURL,
    collectDuplicates,
    csvToJSON,
    generateRandomString,
    uploadedURLsShaper,
} from './helpers';

const router = express.Router();

const diminutioRoutes = ({
    allURLs,
    createURL,
    getURL,
    uploadURLs,
}) => {
    // gets all existing urls
    router.get('/all', (req, res) => {
        allURLs(results => res.send(results))
            .catch(error => res.status(500).send({ error }));
    });

    router.get('/dupes', (req, res) => {
        allURLs(results => res.send(collectDuplicates(results)));
    });

    // redirect to long URL if a short URL is passed
    router.get('/:shortUrl?', (req, res) => {
        const {
            params: { shortUrl }, // are they trying to get a redirection?
            query: { longUrl, url }, // or are they trying to create a new url
        } = req;

        if (shortUrl || longUrl || url) {
            const filter = (
                shortUrl ? { shortUrl }
                : longUrl ? { longUrl: cleanURL(encodeURI(longUrl)) }
                : { longUrl: url } // this won't happen, dev purposes only
            );

            return getURL(filter, results => (
                shortUrl // they seek to be redirected
                    ? results?.length > 0 // TODO produce notice to replace duplicate links with the one provided here.
                        ? res.redirect(307, results[0].longUrl) // so, take them to the first one found
                        : res.status(400).send({ error: `Found no matching results for ${shortUrl}` }) // or throw error

                    // longUrl was given, trying to find/create a short URL hash for its destination
                    : results?.length > 0 // if any was found.
                        ? res.send({
                            longUrl: results[0].longUrl,
                            shortUrl: `${process.env.diminutionURL}/${results[0].shortUrl}`,
                            success: true,
                        })

                        // else, create a new short URL with the redirection destination provided
                        : createURL({ // work in progress, must check if short exists first
                            creation: (new Date()).valueOf(),
                            ...filter,
                            shortUrl: generateRandomString(),
                        }, newShortUrl => res.send({
                            ...filter,
                            shortUrl: `${process.env.diminutionURL}/${newShortUrl}`,
                            success: true,
                        }))
            )).catch(error => res.status(500).send({ error }));
        }

        return res.status(400).send('You gave me nada!');
    });

    // create short URL
    router.post('/', (req, res) => {
        try {
            const reqContentType = req.is();
            const timestamp = new Date();

            const parsedData = req.query.url
                ? { // work in progress, must check if short exists first
                    longUrl: cleanURL(req.query.url),
                    creation: timestamp.valueOf(),
                    shortUrl: generateRandomString(),
                }
                : reqContentType === 'text/plain'
                    ? csvToJSON(req.body, {
                        creation: timestamp.valueOf(),
                        // TODO: get column name replacements using query params
                    })
                : reqContentType === 'application/json'
                    ? console.log('JSON parsing is still being implemented in this service')
                : req.body;

            const response = Array.isArray(parsedData)
                ? uploadURLs(uploadedURLsShaper(parsedData))
                : createURL(parsedData, null, timestamp);

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong processing your request');
        }
    });

    return router;
};

export default diminutioRoutes;
