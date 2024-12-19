import { Client } from '@elastic/elasticsearch'
import { Pool } from 'pg'

const pgPool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_db',
  password: 'your_password',
  port: 5432,
})

const esClient = new Client({
  node: 'http://localhost:9200'
})

async function compareSearchPerformance() {
  console.time('PostgreSQL Search')
  
  const pgQuery = `
    SELECT * FROM products 
    WHERE 
      (name ILIKE '%phone%' OR description ILIKE '%phone%')
      AND price BETWEEN 500 AND 1000
      AND category = 'electronics'
      AND (
        description ILIKE '%camera%' 
        OR description ILIKE '%battery%'
      )
    ORDER BY 
      CASE 
        WHEN name ILIKE '%phone%' THEN 1
        WHEN description ILIKE '%phone%' THEN 2
        ELSE 3
      END,
      price DESC;
  `
  const pgResult = await pgPool.query(pgQuery)
  console.timeEnd('PostgreSQL Search')

  console.time('Elasticsearch Search')
  // Equivalent Elasticsearch query
  const esResult = await esClient.search({
    index: 'products',
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: 'phone',
              fields: ['name^2', 'description'],
              fuzziness: 'AUTO'
            }
          },
          {
            range: {
              price: {
                gte: 500,
                lte: 1000
              }
            }
          },
          {
            term: {
              category: 'electronics'
            }
          },
          {
            multi_match: {
              query: 'camera battery',
              fields: ['description'],
              operator: 'or'
            }
          }
        ]
      }
    },
    sort: [
      '_score',
      { price: 'desc' }
    ]
  })
  console.timeEnd('Elasticsearch Search')
}

// Function to demonstrate full-text search capabilities
async function compareTextSearchCapabilities() {
  // PostgreSQL: Searching for "Samsung phone" (might miss "Samsung smartphone")
  const pgTextQuery = `
    SELECT * FROM products 
    WHERE name ILIKE '%samsung%' AND name ILIKE '%phone%'
  `

  // Elasticsearch: Will find related terms and rank by relevance
  const esTextQuery = await esClient.search({
    index: 'products',
    query: {
      multi_match: {
        query: 'Samsung phone',
        fields: ['name', 'description'],
        fuzziness: 'AUTO',
        operator: 'or'
      }
    }
  })
}

// Function to demonstrate faceted search
async function compareFacetedSearch() {
  // PostgreSQL: Multiple queries needed for facets
  const pgFacetQueries = [
    `SELECT category, COUNT(*) FROM products GROUP BY category`,
    `SELECT price_range, COUNT(*) 
     FROM (
       SELECT 
         CASE 
           WHEN price < 500 THEN 'Under $500'
           WHEN price < 1000 THEN '$500-$1000'
           ELSE 'Over $1000'
         END as price_range
       FROM products
     ) t 
     GROUP BY price_range`
  ]

  // Elasticsearch: Single query for all facets
  const esFacetQuery = await esClient.search({
    index: 'products',
    size: 0, // We only want aggregations
    aggs: {
      categories: {
        terms: { field: 'category' }
      },
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
}

// Example: Product search with filters and facets
async function productSearch(searchText: string, filters: any) {
  // PostgreSQL: Multiple queries needed
  const pgQuery = `
    SELECT p.* 
    FROM products p
    WHERE 
      p.name ILIKE $1 
      AND p.price BETWEEN $2 AND $3
      AND p.category = ANY($4)
    ORDER BY 
      CASE WHEN p.name ILIKE $1 THEN 1 ELSE 2 END,
      p.price DESC
  `

  // Elasticsearch: Single query with better results
  const esQuery = await esClient.search({
    index: 'products',
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: searchText,
              fields: ['name^2', 'description'],
              fuzziness: 'AUTO'
            }
          }
        ],
        filter: [
          { range: { price: filters.priceRange } },
          { terms: { category: filters.categories } }
        ]
      }
    },
    aggs: {
      categories: { terms: { field: 'category' } },
      price_ranges: { range: { field: 'price', ranges: filters.ranges } }
    },
    sort: ['_score', { price: 'desc' }]
  })
} 