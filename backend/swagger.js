const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FMD User App API',
      version: '1.0.0',
      description: 'API documentation for FMD User Application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            profilePic: {
              type: 'string',
              description: 'Profile picture filename'
            },
            bio: {
              type: 'string',
              description: 'User bio'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            profilePic: {
              type: 'string',
              description: 'Profile picture filename'
            },
            bio: {
              type: 'string',
              description: 'User bio'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['title', 'description', 'user'],
          properties: {
            _id: {
              type: 'string',
              description: 'Project ID'
            },
            title: {
              type: 'string',
              description: 'Project title'
            },
            description: {
              type: 'string',
              description: 'Project description'
            },
            user: {
              type: 'string',
              description: 'User ID who owns the project'
            },
            zipFilePath: {
              type: 'string',
              description: 'Path to the project zip file'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Project tags'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived', 'deployed', 'processing', 'failed'],
              description: 'Project status'
            },
            deployedIP: {
              type: 'string',
              description: 'Deployed IP address'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Path to the API routes files
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FMD User App API Documentation'
  })
};
