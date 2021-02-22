import express from 'express';

const router = express.Router();

const diminutioRoutes = ({
    allURLs,
    getURL,
}) => {
    // gets all existing urls
    router.get('/all', (req, res) => {
        allURLs(results => res.send(results))
            .catch(error => res.status(500).send({ error }));
    });

    // redirect to long URL if a short URL is passed
    router.get('/:shortUrl?', (req, res) => {
        const {
            params: { shortUrl }, // are they trying to get a redirection?
        } = req;

        if (shortUrl) {
            const filter = (
                shortUrl ? { shortUrl }
                : {}
            );

            return getURL(filter, results => {
                if (results?.length === 0) {
                    if (shortUrl) {
                        return res.status(400).send({ error: 'Found no matching results' });
                    }
                } else if (results?.length > 0) {
                    if (shortUrl) {
                        return res.redirect(results[0].longUrl);
                    }
                }

                return res.status(500).send({ error: 'Something went wrong when handling your request' });
            }).catch(error => res.status(500).send({ error }));
        }

        return res.status(400).send('You gave me nada!');
    });

    return router;
};

export default diminutioRoutes;
