export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'WhatsApp API',
    version: '1.0.0',
    description: 'RESTful API for sending and scheduling WhatsApp messages',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'WhatsApp',
      description: 'WhatsApp messaging operations'
    },
    {
      name: 'Scheduled Messages',
      description: 'Scheduled message operations'
    },
    {
      name: 'Health',
      description: 'API health check'
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    },
    '/whatsapp/send': {
      post: {
        tags: ['WhatsApp'],
        summary: 'Send a WhatsApp message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SendMessageRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Message sent successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '503': {
            description: 'Service unavailable (WhatsApp not ready)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/scheduled-messages': {
      post: {
        tags: ['Scheduled Messages'],
        summary: 'Schedule a new message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ScheduleMessageRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Message scheduled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ScheduledMessageResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      get: {
        tags: ['Scheduled Messages'],
        summary: 'Get all scheduled messages',
        responses: {
          '200': {
            description: 'List of scheduled messages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ScheduledMessage'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/scheduled-messages/bulk': {
      post: {
        tags: ['Scheduled Messages'],
        summary: 'Schedule multiple messages',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkScheduleRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Messages scheduled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ScheduledMessage'
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/scheduled-messages/{id}': {
      get: {
        tags: ['Scheduled Messages'],
        summary: 'Get a specific scheduled message',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Scheduled message details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ScheduledMessageResponse'
                }
              }
            }
          },
          '404': {
            description: 'Message not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Scheduled Messages'],
        summary: 'Cancel a scheduled message',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Message cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          },
          '404': {
            description: 'Message not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      SendMessageRequest: {
        type: 'object',
        required: ['to', 'message'],
        properties: {
          to: {
            type: 'string',
            description: 'Phone number (10-15 digits)',
            example: '6281234567890'
          },
          message: {
            type: 'string',
            description: 'Message content (max 4096 characters)',
            example: 'Hello, this is a test message!'
          }
        }
      },
      ScheduleMessageRequest: {
        type: 'object',
        required: ['to', 'message', 'scheduledTime'],
        properties: {
          to: {
            type: 'string',
            description: 'Phone number (10-15 digits)',
            example: '6281234567890'
          },
          message: {
            type: 'string',
            description: 'Message content (max 4096 characters)',
            example: 'Hello, this is a scheduled message!'
          },
          scheduledTime: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 datetime when the message should be sent',
            example: '2024-01-01T10:00:00Z'
          }
        }
      },
      BulkScheduleRequest: {
        type: 'object',
        required: ['messages'],
        properties: {
          messages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ScheduleMessageRequest'
            }
          }
        }
      },
      ScheduledMessage: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          to: {
            type: 'string',
            example: '6281234567890'
          },
          message: {
            type: 'string',
            example: 'Hello, this is a scheduled message!'
          },
          scheduledTime: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z'
          },
          status: {
            type: 'string',
            enum: ['pending', 'sent', 'failed', 'cancelled'],
            example: 'pending'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-25T08:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-25T08:00:00Z'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string',
            example: 'Error message description'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          message: {
            type: 'string',
            example: 'Server is healthy'
          }
        }
      },
      ScheduledMessageResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            $ref: '#/components/schemas/ScheduledMessage'
          }
        }
      }
    }
  }
}; 