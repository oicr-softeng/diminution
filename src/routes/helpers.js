export const cleanURL = (input = '') =>
  ['http', 'https'].some((scheme) => input.startsWith(scheme)) ? input : `http://${input}`;

export const collectDuplicates = (rows) =>
  rows.reduce((acc, row) => {
    const found = rows.filter(
      ({ longUrl = '' }) => longUrl.toLowerCase() === row.longUrl.toLowerCase(),
    );

    return found.length > 1
      ? {
          ...acc,
          [row.id]: found,
        }
      : acc;
  }, {});

export const csvToJSON = (
  csv = '',
  { creation = new Date(), destinationColumnName = 'longUrl', replacements = {} },
) => {
  const rows = csv.split(/\r?\n/g).filter((row) => row); // removes empty lines

  const headers = rows[0]
    .split(',')
    .map((header) => (header[0].toLowerCase() + header.slice(1)).trim());

  const destinationIndex = headers.findIndex(
    (header) => header.toLowerCase() === destinationColumnName.toLowerCase(),
  );

  return rows
    .slice(1) // removing the headers first (not an actual row)
    .map((row) => {
      // breaking them into columns
      const firstAttempt = row.split(','); // ideally this would suffice

      // but just in case...
      return firstAttempt.length > headers.length // we should handle a row getting jumbled by unencoded urls
        ? firstAttempt
            .slice(0, destinationIndex) // so, we get columns before the destination
            .concat(
              // appending the destination itself
              encodeURI(
                // encoding it this time
                cleanURL(
                  // and ensuring the URL starts with http(s)
                  firstAttempt
                    .slice(
                      destinationIndex, // this should be the destination start
                      destinationIndex + 1 - headers.length, // and this where it should end
                    )
                    .join(','), // putting it all back together
                ),
              ),
            )
            .concat(firstAttempt.slice(-5)) // and then we append the remaining columns
        : firstAttempt; // this was a good row all along
    })
    .filter(
      (row, rowIndex) =>
        row.length === headers.length || // if any row was invalid for any reason
        (process.env.DEBUG && console.log('discarded', rowIndex + 2, row)), // row number based on the original CSV
    )
    .map((row) =>
      headers.reduce(
        (acc, header, column) => {
          const value = row[column];

          return value
            ? {
                ...acc,
                [replacements[header] || header]: value,
              }
            : (process.env.DEBUG &&
                console.log('possibly corrupted value for', header, value, '\nin row\n', row),
              acc);
        },
        { creation },
      ),
    );
};

export const generateRandomString = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ';

  return Array.from({ length }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length)),
  ).join('');
};

export const parseBooleanEnv = (strValue = 'false') =>
  typeof strValue === 'string' && ['false', 'true'].includes(strValue?.toLowerCase())
    ? JSON.parse(strValue.toLowerCase())
    : false;

// ignores any superfluous elements, keeping only what we want from the data
export const uploadedURLsShaper = (data) =>
  data.map(({ creation, longUrl, lastUsed, timesUsed, shortUrl }) => ({
    creation,
    longUrl,
    lastUsed,
    timesUsed,
    shortUrl,
  }));
