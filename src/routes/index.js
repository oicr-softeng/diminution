import express from 'express';

import {
  cleanURL,
  collectDuplicates,
  csvToJSON,
  generateRandomString,
  uploadedURLsShaper,
} from './helpers';

const router = express.Router();

// Diminution may be used as a middleware, if you want to set its URLs at the root of another site.
// These EnvVars tell diminution you have a URL they can redirect/passthrough to if it cannot handle a request, etc.
const {
  DEBUG,
  DIMINUTION_URL,
  PASSTHROUGH_FAILURE_FILTER_SPLATS: filterFailurePassthrough,
  PASSTHROUGH_FAILURE_ENDPOINT: passthroughFailureEndpoint,
  PASSTHROUGH_ROOT_FILTER_SPLATS: filterPassthrough,
  PASSTHROUGH_ROOT_URL: passthrough,
} = process.env;

const diminutionRoutes = ({ allURLs, createURL, getURL, uploadURLs }) => {
  // gets all existing urls
  router.get('/all', (req, res) => {
    allURLs((results) => res.send(results)).catch((error) => res.status(500).send({ error }));
  });

  router.get('/dupes', (req, res) => {
    allURLs((results) => res.send(collectDuplicates(results)));
  });

  // redirect to long URL if a short URL is passed, or serve as a passthrough
  router.get('/:shortUrl?', (req, res) => {
    const {
      params: { shortUrl }, // are they trying to get a redirection?
      query: { longUrl, url }, // or are they trying to create a new url
    } = req;

    if (shortUrl || longUrl || url || passthrough) {
      const filter = shortUrl
        ? { shortUrl }
        : longUrl
        ? { longUrl: cleanURL(encodeURI(longUrl)) }
        : passthrough // if they didn't pass anything to filter by, they may just be looking for a site behind
        ? res.redirect(`${passthrough}${filterPassthrough ? '' : req.originalUrl}`) // so catch and release
        : { longUrl: url }; // this shouldn't happen, unless purposely, while working in dev mode
      console.log('req?', req);

      DEBUG && console.log('\n\n---\nRequest made from', req.get('host'), '\n', req.originalUrl);

      return (
        res.headersSent ||
        getURL(
          filter,
          (results) => (
            DEBUG && console.log(filter, results),
            shortUrl // they seek to be redirected
              ? results?.length > 0 // TODO produce notice to replace duplicate links with the one provided here.
                ? res.redirect(307, results[0].longUrl) // so, take them to the first one found
                : // no results found, meaning it is not something Diminution can handle
                passthrough // if there's any site/service we're in front of
                ? res.redirect(
                    `${passthrough}/${passthroughFailureEndpoint}${
                      filterFailurePassthrough ? '' : req.originalUrl
                    }`,
                  ) // it may be their resource
                : res
                    .status(400) // else throw an error
                    .send({ error: `Found no matching results for ${shortUrl}` })
              : // longUrl (or dev 'url') was given, trying to find/create a short URL hash for its destination
              results?.length > 0 // if any was found.
              ? res.send({
                  longUrl: results[0].longUrl,
                  shortUrl: `${DIMINUTION_URL}/${results[0].shortUrl}`,
                  success: true,
                })
              : // else, create a new short URL with the redirection destination provided
                createURL(
                  {
                    // work in progress, must check if short exists first
                    creation: new Date().valueOf(),
                    ...filter,
                    shortUrl: generateRandomString(),
                  },
                  (newShortUrl) =>
                    res.send({
                      ...filter,
                      shortUrl: `${DIMINUTION_URL}/${newShortUrl}`,
                      success: true,
                    }),
                )
          ),
        ).catch((error) => res.status(500).send({ error }))
      );
    }

    return res.status(400).send('You gave me nada!');
  });

  // create short URL
  router.post('/', (req, res) => {
    try {
      const reqContentType = req.is();
      const timestamp = new Date();

      const parsedData = req.query.url
        ? {
            // work in progress, must check if short exists first
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

export default diminutionRoutes;
