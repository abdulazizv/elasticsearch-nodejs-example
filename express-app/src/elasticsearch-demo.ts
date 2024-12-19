import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: 'http://localhost:9200'
})

async function setupDemo() {
  try {
    // Create an index for products
    await client.indices.create({
      index: 'products',
      mappings: {
        properties: {
          name: { type: 'text' },
          description: { type: 'text' },
          price: { type: 'float' },
          category: { type: 'keyword' },
          tags: { type: 'keyword' },
          created_at: { type: 'date' }
        }
      }
    })

    // Add sample products
    await client.bulk({
      refresh: true,
      operations: [
        { index: { _index: 'products' } },
        {
          name: 'iPhone 13',
          description: 'Latest Apple smartphone with great camera',
          price: 999.99,
          category: 'electronics',
          tags: ['phone', 'apple', 'smartphone'],
          created_at: new Date()
        },
        { index: { _index: 'products' } },
        {
          name: 'Samsung Galaxy S21',
          description: 'Android smartphone with excellent features',
          price: 899.99,
          category: 'electronics',
          tags: ['phone', 'samsung', 'smartphone'],
          created_at: new Date()
        },
        { index: { _index: 'products' } },
        {
          name: 'MacBook Pro',
          description: 'Powerful laptop for professionals',
          price: 1299.99,
          category: 'electronics',
          tags: ['laptop', 'apple', 'computer'],
          created_at: new Date()
        }
      ]
    })

    console.log('Setup completed successfully!')
  } catch (error) {
    console.error('Setup error:', error)
  }
}

async function demonstrateFeatures() {
  try {
    // 1. Full-text search
    console.log('\n1. Full-text Search:')
    const searchResult = await client.search({
      index: 'products',
      query: {
        multi_match: {
          query: 'smartphone features',
          fields: ['name', 'description']
        }
      }
    })
    console.log('Search results:', searchResult.hits.hits)

    // 2. Filtering
    console.log('\n2. Filtering by Price Range:')
    const filterResult = await client.search({
      index: 'products',
      query: {
        range: {
          price: {
            gte: 900,
            lte: 1000
          }
        }
      }
    })
    console.log('Filtered results:', filterResult.hits.hits)

    // 3. Aggregations
    console.log('\n3. Aggregations by Category:')
    const aggResult = await client.search({
      index: 'products',
      aggs: {
        categories: {
          terms: { field: 'category' },
          aggs: {
            avg_price: { avg: { field: 'price' } }
          }
        }
      }
    })
    console.log('Aggregation results:', aggResult.aggregations)

    // 4. Fuzzy Search (typo-tolerant)
    console.log('\n4. Fuzzy Search:')
    const fuzzyResult = await client.search({
      index: 'products',
      query: {
        fuzzy: {
          name: {
            value: 'iphone',
            fuzziness: 'AUTO'
          }
        }
      }
    })
    console.log('Fuzzy search results:', fuzzyResult.hits.hits)

  } catch (error) {
    console.error('Demo error:', error)
  }
}

export async function runDemo() {
  await setupDemo()
  await demonstrateFeatures()
} 