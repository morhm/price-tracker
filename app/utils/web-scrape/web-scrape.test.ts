import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cheerio from 'cheerio';

import { extractFromLdJson } from './extract-from-ld-json';
import { extractFromMicrodata } from './extract-from-microdata';
import { extractFromHeuristics } from './extract-from-heuristics';

describe('extractFromLdJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract product data from valid ld+json script', () => {
    const $ = cheerio.load(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Test Product",
          "offers": {
            "price": "19.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
    `);

    const result = extractFromLdJson($);
    expect(result).toEqual({
      title: 'Test Product',
      price: 19.99,
      isAvailable: true
    });
  });

  it('should return null for no ld+json scripts', () => {
    const $ = cheerio.load('<div>No LD+JSON here</div>');
    const result = extractFromLdJson($);
    expect(result).toBeNull();
  });

  it('should handle multiple ld+json scripts', () => {
    const $ = cheerio.load(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "First Product",
          "offers": {
            "price": "29.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Second Product",
          "offers": {
            "price": "39.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/OutOfStock"
          }
        }
      </script>
    `);

    const result = extractFromLdJson($);
    expect(result).toEqual({
      title: 'First Product',
      price: 29.99,
      isAvailable: true
    });
  });
});

describe('extractFromMicrodata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract product data from microdata markup', () => {
    const $ = cheerio.load(`
      <div itemscope itemtype="https://schema.org/Product">
        <h1 itemprop="name">Test Microdata Product</h1>
        <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <span itemprop="price" content="25.99">$25.99</span>
          <link itemprop="availability" href="https://schema.org/InStock">
        </div>
      </div>
    `);

    const result = extractFromMicrodata($);
    expect(result).toEqual({
      title: 'Test Microdata Product',
      price: 25.99,
      isAvailable: true
    });
  });

  it('should extract price from text when content attribute is missing', () => {
    const $ = cheerio.load(`
      <div itemscope itemtype="https://schema.org/Product">
        <h1 itemprop="name">Product Name</h1>
        <div itemprop="offers">
          <span itemprop="price">$15.50</span>
          <span itemprop="availability">InStock</span>
        </div>
      </div>
    `);

    const result = extractFromMicrodata($);
    expect(result).toEqual({
      title: 'Product Name',
      price: 15.50,
      isAvailable: true
    });
  });

  it('should return null when no microdata product found', () => {
    const $ = cheerio.load('<div>No microdata here</div>');
    const result = extractFromMicrodata($);
    expect(result).toBeNull();
  });

  it('should handle out of stock availability', () => {
    const $ = cheerio.load(`
      <div itemscope itemtype="https://schema.org/Product">
        <span itemprop="name">Out of Stock Product</span>
        <div itemprop="offers">
          <span itemprop="price">99.99</span>
          <span itemprop="availability">OutOfStock</span>
        </div>
      </div>
    `);

    const result = extractFromMicrodata($);
    expect(result).toEqual({
      title: 'Out of Stock Product',
      price: 99.99,
      isAvailable: false
    });
  });
});

describe('extractFromHeuristics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract title from h1 tag', () => {
    const $ = cheerio.load(`
      <html>
        <body>
          <h1>Heuristic Product Title</h1>
          <div class="price">$49.99</div>
          <div class="stock-status">In Stock</div>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Heuristic Product Title',
      price: 49.99,
      isAvailable: true
    });
  });

  it('should extract title from meta tags when h1 not available', () => {
    const $ = cheerio.load(`
      <html>
        <head>
          <meta property="og:title" content="Meta Title Product">
          <title>Page Title</title>
        </head>
        <body>
          <span class="product-price">$12.34</span>
          <span class="availability">available</span>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Meta Title Product',
      price: 12.34,
      isAvailable: true
    });
  });

  it('should detect various currency symbols', () => {
    const $ = cheerio.load(`
      <html>
        <body>
          <h1>Euro Product</h1>
          <div class="price">€75.00</div>
          <div>In Stock</div>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Euro Product',
      price: 75.00,
      isAvailable: true
    });
  });

  it('should handle out of stock keywords', () => {
    const $ = cheerio.load(`
      <html>
        <body>
          <h1>Sold Out Product</h1>
          <div class="price">$99.99</div>
          <div class="stock-status">Sold Out</div>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Sold Out Product',
      price: 99.99,
      isAvailable: false
    });
  });

  it('should extract price from global text search', () => {
    const $ = cheerio.load(`
      <html>
        <body>
          <h1>Product with Text Price</h1>
          <p>The current price is $33.50 for this item.</p>
          <div>Limited Stock</div>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Product with Text Price',
      price: 33.50,
      isAvailable: true
    });
  });

  it('should assume availability when price found but no stock info', () => {
    const $ = cheerio.load(`
      <html>
        <body>
          <h1>Simple Product</h1>
          <div class="price">$19.99</div>
        </body>
      </html>
    `);

    const result = extractFromHeuristics($);
    expect(result).toEqual({
      title: 'Simple Product',
      price: 19.99,
      isAvailable: true
    });
  });

  it('should return null when no useful data found', () => {
    const $ = cheerio.load('<div>No useful content</div>');
    const result = extractFromHeuristics($);
    expect(result).toBeNull();
  });
});