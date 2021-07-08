require('dotenv').config()

const { getListings } = require('./tcgplayer');
const { send } = require('./mail');

const RECIPIENT = process.env.EMAIL_RECIPIENT;
const CARD_URL = process.env.CARD_URL;
const CARD_MAX_PRICE = Number.parseFloat(process.env.CARD_MAX_PRICE);

const ATTEMPT_INTERVAL = 15 * 1000 * 60;

async function main() {
    let qualifyingListingFound = false;
    while(!qualifyingListingFound) {
        const matchingListing = await getMatchingListing();

        if (matchingListing) {
            console.log(`[SUCCESS]:   Match found`);
            console.log(JSON.stringify(matchingListing, null, 2));

            await sendNotificationEmail(matchingListing);
            qualifyingListingFound = true;
        } else {
            console.log(`[SEARCHING]: No matches found at ${new Date().toISOString()}`);
            await wait(ATTEMPT_INTERVAL);
        }
    }
}

async function getMatchingListing() {
    const listings = await getListings(CARD_URL);

    for (const listing of listings) { 
        const combinedPrice = listing.price + listing.shipping;

        if (combinedPrice < CARD_MAX_PRICE) {
            return listing;
        }
    }

    return null;
}

async function sendNotificationEmail(listing) {
    const subject = `[TCGPlayer Notifier] - We found a listing that matched your requirements`;
    const html = `
<h1>We found a listing that matched your requirements</h1>
"${listing.seller.name}" is selling your card for $${listing.price} + $${listing.shipping} shipping.
<a href="${CARD_URL}">Here is the page</a>.`;

    await send(RECIPIENT, subject, html);
}

function wait(n) {
    return new Promise((resolve) => setTimeout(resolve, n));
}

main().catch(console.error);