import { NextResponse } from "next/server"
import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

export async function POST(req: Request) {
    const { searchPrompt: userSearch} = await req.json()

    if(!userSearch){
        return NextResponse.json("Provide a seach prompt")
    }

    let browser;
    try{
        browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();
        await page.goto("https://www.dsw.com/");
        await page.type("#searchboxDesktop", userSearch);
        await page.keyboard.press("Enter");
        await page.waitForNavigation();

        const html = await page.content();
        const $ = cheerio.load(html);

        const prices = $("div.product-tile__detail-price.dbi-body-2.font-medium.mr-5.text-red.ng-star-inserted")
			.map((index, element) => {
				return $(element).text();
			})
			.get();

		const titles = $("span.dbi-body-2.font-regular.ng-star-inserted")
			.map((index, element) => {
				return $(element).text();
			})
			.get();
            
		// const reviews = $("span.a-icon-alt")
		// 	.map((index, element) => {
		// 		return $(element).text();
		// 	})
		// 	.get();

		// const imageUrls = $("img")
		// 	.map((index, element) => {
		// 		return $(element).attr("src");
		// 	})
		// 	.get();

        // const prodUrl = $("a.image")
        //     .map((index, element) =>{
        //         return "https://www.dickssportinggoods.com" + $(element).attr("href")
        //     })
        //     .get()

		const products = [];

		for (let i = 0; i < titles.length; i++) {
			const item = {
				price: prices[i],
				title: titles[i],
				// review: reviews[i],
				// imageUrl: imageUrls[i],
                // prodUrl: prodUrl[i],
			};
			products.push(item);
		}

		return NextResponse.json({ products });
    } catch(err){
        let message
        if(err instanceof Error) message = err.message
        else message = String(err)
        return NextResponse.json({message})
    } finally {
        if(browser){
            await browser.close();
        }
    }
}