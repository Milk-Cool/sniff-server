# sniff-server
sniff server &amp; dashboard

## what is this?
sniff allows you to montor the amount of people in an area. it supports multiple sniffing devices, SSID tracking, searching and exporting data and much more!

this is the repo for the **server**. if you're looking for the repo for the esp32 **client**, go [here](https://github.com/Milk-Cool/sniff-esp32).

## setup
In your `.env`, add the following:
```
POSTGRES_PASSWORD=SecurePassword
ADMIN_KEY=AnotherSecurePassword
```
Then, run the service with Compose:
```sh
docker-compose up
```
It'll start listening at port 9097. Don't forget to enter your admin key in the "auth" section!