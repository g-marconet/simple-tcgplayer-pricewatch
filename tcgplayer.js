const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const BROWSER = 'firefox';

const LISTING_ITEM_SELECTOR = '.listing-item';
const CONDITION_SELECTOR = '.listing-item__condition a';
const PRICE_SELECTOR = '.listing-item__price';
const SHIPPING_SELECTOR = '.shipping-messages__price';
const SELLER_NAME_SELECTOR = '.seller-info__name';
const SELLER_RATING_SELECTOR = '.seller-info__rating';
const SELLER_SALES_SELECTOR = '.seller-info__sales';

const PRICE_REGEX = /\$(\d+.\d\d)/;
const SHIPPING_REGEX = /\+ \$(\d+.\d\d) Shipping/;
const SELLER_RATING_REGEX = /(\d+)%/;
const SELLER_SALES_REGEX = /\((\d+)\+? Sales\)/;

async function getListings(url) {
    const options = new firefox.Options();
    const driver = await new Builder()
        .forBrowser(BROWSER)
        .setFirefoxOptions(options.headless())
        .build();

    try {
        await driver.get(url);
        await driver.wait(until.elementLocated(By.css(LISTING_ITEM_SELECTOR)));
        const listingsHTML = await driver.findElements(By.css(LISTING_ITEM_SELECTOR));

        return await Promise.all(listingsHTML.map(getListingDataFromHTML));
    } finally {
        await driver.quit();
    }
}

async function getListingDataFromHTML(listingHTML) {
    const condition = await listingHTML.findElement(By.css(CONDITION_SELECTOR)).getText();
    const priceRaw = await listingHTML.findElement(By.css(PRICE_SELECTOR)).getText();
    const shippingRaw = await listingHTML.findElement(By.css(SHIPPING_SELECTOR)).getText()
        .catch(() => '+ $0.00 Shipping'); // Default to free shipping if it fails to find the element

    const sellerName = await listingHTML.findElement(By.css(SELLER_NAME_SELECTOR)).getText();
    const sellerRatingRaw = await listingHTML.findElement(By.css(SELLER_RATING_SELECTOR)).getText();
    const sellerSalesRaw = await listingHTML.findElement(By.css(SELLER_SALES_SELECTOR)).getText();

    const price = extractFloatFromFirstMatch(priceRaw, PRICE_REGEX);
    const shipping = extractFloatFromFirstMatch(shippingRaw, SHIPPING_REGEX);
    const sellerRating = extractFloatFromFirstMatch(sellerRatingRaw, SELLER_RATING_REGEX);
    const sellerSales = extractFloatFromFirstMatch(sellerSalesRaw, SELLER_SALES_REGEX);

    return {
        condition,
        price,
        shipping,

        seller: {
            name: sellerName,
            ratingPercent: sellerRating,
            sales: sellerSales,
        },
    };
}

function extractFloatFromFirstMatch(target, regex) {
    return Number.parseFloat(target.match(regex)[1]);
}

module.exports = {
    getListings,
};
