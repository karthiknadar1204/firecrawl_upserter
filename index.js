
import FireCrawlApp from '@mendable/firecrawl-js';
import fs from 'fs';

async function scrapeUrls() {
	const app = new FireCrawlApp({ apiKey: "" });
	const urls = JSON.parse(fs.readFileSync('operating_systems/geeks_for_geeks/urls/urls4.json', 'utf8'));
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

	fs.writeFileSync('operating_systems/geeks_for_geeks/results/results4.json', JSON.stringify(results, null, 2));
	console.log('Scraping completed. Results saved to results4.json');
}

scrapeUrls();