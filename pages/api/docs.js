export default function handler (req, res) {
  res.status(200).json({
    openapi: '3.0.0',
    info: {
      title: 'Gold Bars Exchange API',
      version: '1.0.0'
    },
    servers: [{ url: '/' }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        GoldBar: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            contract: { type: 'string' },
            owner: { type: 'string' },
            reference: { type: 'string' },
            askingPrice: { type: 'number' },
            state: { type: 'string' },
            buyer: { type: 'string' },
            offerPrice: { type: 'number' }
          }
        },
        GoldBarCreate: {
          type: 'object',
          required: ['contract', 'owner', 'reference', 'askingPrice'],
          properties: {
            contract: { type: 'string' },
            owner: { type: 'string' },
            reference: { type: 'string' },
            askingPrice: { type: 'number' },
            state: { type: 'string' },
            buyer: { type: 'string' },
            offerPrice: { type: 'number' }
          }
        },
        GoldBarUpdate: {
          type: 'object',
          properties: {
            contract: { type: 'string' },
            owner: { type: 'string' },
            reference: { type: 'string' },
            askingPrice: { type: 'number' },
            state: { type: 'string' },
            buyer: { type: 'string' },
            offerPrice: { type: 'number' }
          }
        },
        GoldBarList: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/GoldBar' }
            },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        }
      }
    },
    paths: {
      '/api/v1/goldbars': {
        get: {
          summary: 'List gold bars',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            { in: 'query', name: 'limit', schema: { type: 'number' } },
            { in: 'query', name: 'offset', schema: { type: 'number' } }
          ],
          responses: {
            200: {
              description: 'List of gold bars',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/GoldBarList' } } }
            }
          }
        },
        post: {
          summary: 'Create a gold bar',
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GoldBarCreate' } } }
          },
          responses: {
            201: { description: 'Created' }
          }
        }
      },
      '/api/v1/goldbars/{id}': {
        get: {
          summary: 'Get a gold bar by id',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Gold bar', content: { 'application/json': { schema: { $ref: '#/components/schemas/GoldBar' } } } },
            404: { description: 'Not found' }
          }
        },
        put: {
          summary: 'Update a gold bar',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GoldBarUpdate' } } }
          },
          responses: { 200: { description: 'Updated' } }
        },
        delete: {
          summary: 'Delete a gold bar',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } }
        }
      }
    }
  })
}
