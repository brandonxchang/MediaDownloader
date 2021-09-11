import express from 'express';
import serveIndex from 'serve-index';
import youtubedl from 'youtube-dl-exec';

const app = express();
const PORT = 3000;
const FOLDER_LOCATION = 'public';
const SAVE_DIRECTORY = '/downloads/';
const OUTPUT_FORMAT = '%(title)s-%(id)s.%(ext)s';

app.use((req, res, next) => {
    // tslint:disable-next-line:no-console
    console.log(req);
    // tslint:disable-next-line:no-console
    console.log('Time: ', Date.now());
    next();
});

app.use('/request-type', (req, res, next) => {
    // tslint:disable-next-line:no-console
    console.log('Request type: ', req.method);
    next();
});

app.use(express.json());
app.use('/public', express.static(FOLDER_LOCATION));
app.use('/public', serveIndex(FOLDER_LOCATION));

app.get('/', (req, res) => {
    res.send('Successful response.');
});

app.post('/download', (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(`Request to download: ${req.body.url}`);

    youtubedl(req.body.url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        format: 'bestaudio/bestvideo/best',
        youtubeSkipDashManifest: true,
        output: `${FOLDER_LOCATION}${SAVE_DIRECTORY}${OUTPUT_FORMAT}`
    })
    // tslint:disable-next-line:no-console
    .then(output => console.log(output));

    res.status(200).send('Success');
});

// tslint:disable-next-line:no-console
app.listen(PORT, () => console.log(`Example app is listening on port ${PORT}.`));
