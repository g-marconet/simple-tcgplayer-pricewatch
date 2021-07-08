# Simple TCGPlayer Pricewatch Script

This will periodically check TCGPlayer to see if a particular card is under a particular threshold.

## Installation

1. Download [Geckodriver](https://github.com/mozilla/geckodriver/releases) and put it into this directory (or your PATH)
2. `npm install`
3. `cp .env.example .env`. Then modify the values to fit your usecase. If you're using GMail, you'll need to go into your [GMail settings](https://myaccount.google.com/lesssecureapps) and allow "Less secure app access" so that you can use username + password with SMTP (at your own risk. I'd recommend using a throwaway email just in case).
4. `node main.js`. Let it run in the background. You'll eventually get an email when the linked card falls below the card max price.