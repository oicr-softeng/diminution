const passThrough = item => item;

const dataHelpers = (urlsTable) => {
    const getURL = (filter = {}, done = passThrough) => urlsTable()
        .where(filter)
        .then(done);

    return {
        allURLs: done => getURL({}, done),
        getURL,
    };
};

export default dataHelpers;
