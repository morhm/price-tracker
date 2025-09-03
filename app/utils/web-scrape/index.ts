import * as cheerio from 'cheerio';

import { extractFromLdJson } from './extract-from-ld-json';
import { extractFromMicrodata } from './extract-from-microdata';
import { extractFromHeuristics } from './extract-from-heuristics';

export interface ScrapedData {
  title: string;
  price: number | null;
  isAvailable: boolean;
}

export const scrapeListingData = async (url: string): Promise<ScrapedData> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    const scrapedData: ScrapedData = {
      title: '',
      price: null,
      isAvailable: false
    };

    // Strategy 1: Extract from LD+JSON
    const ldJsonData = extractFromLdJson($);
    if (ldJsonData) {
      if (ldJsonData.title) scrapedData.title = ldJsonData.title;
      if (ldJsonData.price !== undefined) scrapedData.price = ldJsonData.price;
      if (ldJsonData.isAvailable !== undefined) scrapedData.isAvailable = ldJsonData.isAvailable;
    }

    // Strategy 2: Extract from microdata if LD+JSON didn't provide complete data
    if (!scrapedData.title || scrapedData.price === null || !scrapedData.isAvailable) {
      const microdataData = extractFromMicrodata($);
      if (microdataData) {
        if (!scrapedData.title && microdataData.title) scrapedData.title = microdataData.title;
        if (scrapedData.price === null && microdataData.price !== undefined) scrapedData.price = microdataData.price;
        if (!scrapedData.isAvailable && microdataData.isAvailable !== undefined) scrapedData.isAvailable = microdataData.isAvailable;
      }
    }

    // Strategy 3: Heuristic fallback if structured data didn't provide complete data
    if (!scrapedData.title || scrapedData.price === null || !scrapedData.isAvailable) {
      const heuristicData = extractFromHeuristics($);
      if (heuristicData) {
        if (!scrapedData.title && heuristicData.title) scrapedData.title = heuristicData.title;
        if (scrapedData.price === null && heuristicData.price !== undefined) scrapedData.price = heuristicData.price;
        if (!scrapedData.isAvailable && heuristicData.isAvailable !== undefined) scrapedData.isAvailable = heuristicData.isAvailable;
      }
    }

    return scrapedData;
  } catch (error) {
    console.error('Error scraping listing data:', error);
    throw error;
  }
}