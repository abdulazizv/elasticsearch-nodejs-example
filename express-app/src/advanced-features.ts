import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: 'http://localhost:9200'
})


async function demonstrateAdvancedFeatures() {
  try {
    // 1. Autocomplete suggestions
    const suggestResult = await client.search({
      index: 'products',
      suggest: {
        suggestions: {
          prefix: 'ip',
          completion: {
            field: 'name'
          }
        }
      }
    })

    // 2. Faceted Search
    const facetResult = await client.search({
      index: 'products',
      aggs: {
        tags: {
          terms: { field: 'tags' }
        }
      }
    })

    // 3. Geo-spatial Queries (if you add location data)
    // 4. Real-time Analytics
    // 5. Complex Aggregations
    const complexAgg = await client.search({
      index: 'products',
      aggs: {
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 500 },
              { from: 500, to: 1000 },
              { from: 1000 }
            ]
          }
        }
      }
    })

  } catch (error) {
    console.error('Advanced demo error:', error)
  }
} 