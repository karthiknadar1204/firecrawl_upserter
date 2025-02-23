// Install with npm install @mendable/firecrawl-js
import FireCrawlApp from '@mendable/firecrawl-js';
import fs from 'fs';

async function scrapeUrls() {
	const app = new FireCrawlApp({ apiKey: "fc-18bce297f00f4d1fbf015feaaeba4d60" });
	const urls = JSON.parse(fs.readFileSync('urls5.json', 'utf8'));
	const results = [];

	for (const url of urls) {
		try {
			const scrapeResult = await app.scrapeUrl(url, {
				formats: ["markdown", "html"],
			});
			results.push({ url, data: scrapeResult });
			console.log(`Scraped: ${url}`);
			
			// Wait for 5 seconds before proceeding to the next URL
			await new Promise(resolve => setTimeout(resolve, 7000));
		} catch (error) {
			console.error(`Error scraping ${url}:`, error);
		}
	}

	fs.writeFileSync('results5.json', JSON.stringify(results, null, 2));
	console.log('Scraping completed. Results saved to results.json');
}

scrapeUrls();