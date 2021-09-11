git fetch
git pull
docker build . -t mediadownloader
:: docker volume create --driver local --opt type=cifs --opt device=//ipaddr/path --opt o=username=username,password=password mediashare
docker run --name MediaDownloader -p 3000:3000 -v mediashare:/app -d mediadownloader