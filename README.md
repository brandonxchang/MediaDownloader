# Media Downloader
Based on [Express](http://expressjs.com/).

## Run locally

1. Install [Node.js and npm](https://nodejs.org/)
1. Run `npm install`
1. Run `npm start`
1. Visit [http://localhost:3000/public](http://localhost:3000/public)
1. Send Post Request to [http://localhost:3000/download](http://localhost:3000/download)
with body:
```
{
    "url": "https://youtu.be/dQw4w9WgXcQ"
}
```