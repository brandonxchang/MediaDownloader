import express from 'express';
import serveIndex from 'serve-index';
import youtubedl from 'youtube-dl-exec';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT;
const FOLDER_LOCATION = process.env.FOLDER_LOCATION;
const SAVE_DIRECTORY = process.env.SAVE_DIRECTORY;
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT;
const AUDIO_ONLY = process.env.AUDIO_ONLY === 'true';

const createDLFlags = (fileName: string = null, jsonDump = false) => {
    const flags: Record<string, string | boolean | number> = {
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        format: 'bestaudio/bestvideo/best',
        youtubeSkipDashManifest: true,
        output: `${FOLDER_LOCATION}${SAVE_DIRECTORY}${fileName ? OUTPUT_FORMAT.replace("%(title)s", fileName) : OUTPUT_FORMAT}`
    };

    if (AUDIO_ONLY) {
        flags.extractAudio = true;
        flags.audioFormat = 'mp3';
        flags.audioQuality = 0;
    }

    if (jsonDump) {
        flags.dumpSingleJson = true;
    }

    return flags;
}

const getVideoJsonInfo = async (url: string) => {
    return youtubedl(url, createDLFlags(null, true));
}

app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    // console.log(req);
    // eslint-disable-next-line no-console
    console.log('Time: ', Date.now());
    next();
});

app.use('/request-type', (req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('Request type: ', req.method);
    next();
});

app.use(express.json());
app.use('/public', express.static(FOLDER_LOCATION));
app.use('/public', serveIndex(FOLDER_LOCATION));

app.get('/', (req, res) => {
    res.send('Successful response.');
});

app.post('/format', (req, res) => {
    const body = req.body as { url: string };
    const flags = createDLFlags(null, false);
    flags.listFormats = true;

    youtubedl(body.url, flags)
        // eslint-disable-next-line no-console
        .then(output => console.log(output))
        // eslint-disable-next-line no-console
        .catch(output => console.log(output));

    res.status(200).send('Success');
});

app.post('/videojson', (req, res) => {
    (async () => {
        const body = req.body as { url: string };
        const output = await getVideoJsonInfo(body.url);

        // eslint-disable-next-line no-console
        console.log(output.title);

        res.status(200).send(output);
    })()
        // eslint-disable-next-line no-console
        .catch(e => console.log(e));

});

app.post('/download', (req, res) => {
    (async () => {
        const body = req.body as { url: string };
        const vidInfo = await getVideoJsonInfo(body.url);
        const generatedId = uuidv4();
        const fileName = vidInfo.title.replace(/[\/\\><|?:"*]/g, ' ');
        const downloadedItem = `${FOLDER_LOCATION}${SAVE_DIRECTORY}${fileName}.mp3`;

        // eslint-disable-next-line no-console
        console.log(`Request to download ${vidInfo.title} at ${body.url} as ${downloadedItem}`);
        youtubedl(body.url, createDLFlags(fileName))
            .then(output => {
                // eslint-disable-next-line no-console
                console.log(output);
                // eslint-disable-next-line no-console
                console.log(`Downloaded to: ${downloadedItem}`);
            })
            // eslint-disable-next-line no-console
            .catch(output => console.log(output));

        res.status(200).send({ id: generatedId });
    })()
        // eslint-disable-next-line no-console
        .catch(e => console.log(e));
});

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Example app is listening on port ${PORT}.`));
