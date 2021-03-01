const passThrough = item => item;

const dataHelpers = (urlsTable, urlsBatchInsert) => {
    const createURL = (
        {
            creation,
            longUrl,
            lastUsed,
            timesUsed,
            shortUrl,
        } = {},
        done = passThrough,
    ) => urlsTable()
        .insert({
            creation,
            longUrl,
            lastUsed,
            timesUsed,
            shortUrl,
        })
        .then(() => done(shortUrl));

    const getURL = (filter = {}, done = passThrough) => urlsTable()
        .where(filter)
        .then(done);

    const uploadURLs = (batch, done = passThrough) => urlsBatchInsert(batch)
        .then(result => done(result));

    return {
        allURLs: done => getURL({}, done),
        createURL,
        getURL,
        uploadURLs,
    };
};

export default dataHelpers;
