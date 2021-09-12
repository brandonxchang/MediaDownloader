import express from 'express';
import serveIndex from 'serve-index';
import youtubedl from 'youtube-dl-exec';

const app = express();
const PORT = process.env.PORT;
const FOLDER_LOCATION = process.env.FOLDER_LOCATION;
const SAVE_DIRECTORY = process.env.SAVE_DIRECTORY;
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT;
const AUDIO_ONLY : boolean = process.env.AUDIO_ONLY === 'true';

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

app.post('/download', async (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(`Request to download: ${req.body.url}`);

    const flags : any = {
        // dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        format: 'bestaudio/bestvideo/best',
        youtubeSkipDashManifest: true,
        output: `${FOLDER_LOCATION}${SAVE_DIRECTORY}${OUTPUT_FORMAT}`
    }

    if (AUDIO_ONLY) {
        flags.extractAudio = true;
    }

    youtubedl(req.body.url, flags)
    // tslint:disable-next-line:no-console
    .then(output => console.log(output))
    // tslint:disable-next-line:no-console
    .catch(output => console.log(output));

    res.status(200).send('Success');
});

// tslint:disable-next-line:no-console
app.listen(PORT, () => console.log(`Example app is listening on port ${PORT}.`));
