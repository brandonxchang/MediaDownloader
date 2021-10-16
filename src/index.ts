import express from 'express';
import serveIndex from 'serve-index';
import youtubedl, { YtResponse } from 'youtube-dl-exec';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { constants } from 'fs';
import utf8 from 'utf8';

const app = express();
const PORT = process.env.PORT;
const FOLDER_LOCATION = process.env.FOLDER_LOCATION;
const SAVE_DIRECTORY = process.env.SAVE_DIRECTORY;
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT;
const AUDIO_ONLY = process.env.AUDIO_ONLY === 'true';

function createDLFlags(fileName: string = null, jsonDump: boolean = false) {
    const flags: any = {
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

async function getVideoJsonInfo(url: string) {
    return youtubedl(url, createDLFlags(null, true));
}

app.use((req, res, next) => {
    // tslint:disable-next-line:no-console
    //console.log(req);
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

app.post('/format', (req, res) => {
    const flags = createDLFlags(null, false);
    flags.listFormats = true;

    youtubedl(req.body.url, flags)
        // tslint:disable-next-line:no-console
        .then(output => console.log(output))
        // tslint:disable-next-line:no-console
        .catch(output => console.log(output));

    res.status(200).send('Success');
});

app.post('/videojson', async (req, res) => {
    const output = await getVideoJsonInfo(req.body.url);

    // tslint:disable-next-line:no-console
    console.log(output.title);

    res.status(200).send(output);
});

app.post('/download', async (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(`Request to download: ${req.body.url}`);

    const vidInfo = await getVideoJsonInfo(req.body.url);
    const generatedId = uuidv4();

    youtubedl(req.body.url, createDLFlags(generatedId))
        .then(async output => {
            // tslint:disable-next-line:no-console
            console.log(output);
            const downloadedItem = `${FOLDER_LOCATION}${SAVE_DIRECTORY}${generatedId}.mp3`;
            const renamedItem = `${FOLDER_LOCATION}${SAVE_DIRECTORY}${vidInfo.title}.mp3`;
            const buffer = Buffer.from(renamedItem);
            
            try {
                // tslint:disable-next-line:no-bitwise
                await fs.access(downloadedItem, constants.R_OK | constants.W_OK);
                await fs.copyFile(downloadedItem, renamedItem);
                //fs.rename(downloadedItem, renamedItem);
                // tslint:disable-next-line:no-console
                console.log(`Copied ${downloadedItem} to ${renamedItem} as ${buffer}`);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(`Error trying to rename ${downloadedItem}: ${e}`);
            }
        })
    // tslint:disable-next-line:no-console
    //.catch(output => console.log(output));

    res.status(200).send({ id: generatedId });
});

// tslint:disable-next-line:no-console
app.listen(PORT, () => console.log(`Example app is listening on port ${PORT}.`));
