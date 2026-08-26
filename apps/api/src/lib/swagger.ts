/**
 * OpenAPI 3.0 specification for the Atlas South API.
 * Served via swagger-ui-express at GET /api/docs with brand-matched theming.
 *
 * Colour palette matches docs/build/01-BRAND-SYSTEM.md:
 *   Navy      #002484   60 % (primary background in header)
 *   AccentBlue #0062D6  10 % (interactive elements, focus rings)
 *   BrandBlue  #0078FC  decorative only
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Atlas South Technical Services — API',
    description: `
REST API powering the Atlas South website and admin panel.

**Public endpoints** — no authentication required.
**Admin endpoints** — require a short-lived JWT Bearer token obtained via \`POST /api/admin/auth/login\`.
The access token expires after 15 minutes; use \`POST /api/admin/auth/refresh\` (httpOnly cookie) to obtain a new one silently.

Rate limits:
- General: 100 req / 15 min per IP
- Login: 5 req / 15 min per IP
- Enquiry form: 5 req / 10 min per IP
- Admin API: 300 req / 60 s per IP
    `.trim(),
    version: '1.0.0',
    contact: {
      name: 'Atlas South Technical Services',
      email: 'fm@atlassouthes.com',
      url: 'https://atlassouth.co.uk',
    },
    license: {
      name: 'Private — all rights reserved',
    },
  },
  servers: [
    {
      url: 'http://localhost:9001',
      description: 'Local development (apps/api port 9001)',
    },
    {
      url: 'https://api.atlassouth.co.uk',
      description: 'Production (Render)',
    },
  ],
  tags: [
    { name: 'Public', description: 'No authentication required' },
    { name: 'Admin — Auth', description: 'Login, refresh, logout' },
    { name: 'Admin — Enquiries', description: 'View and manage website enquiries' },
    { name: 'Admin — Applications', description: 'View and manage job applications' },
    { name: 'Admin — Stats', description: 'Dashboard KPI data' },
    { name: 'Admin — Analytics', description: 'Page-view analytics' },
    { name: 'Admin — Users', description: 'Admin account management' },
    { name: 'Admin — Content', description: 'CMS page content management' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Short-lived access token (15 min). Obtain via POST /api/admin/auth/login, then include as `Authorization: Bearer <token>`. Refresh silently with POST /api/admin/auth/refresh.',
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      EnquiryCreate: {
        type: 'object',
        required: ['fullName', 'email', 'phone', 'message', 'sourcePage', 'agreedToPrivacyPolicy'],
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 100, example: 'James Carter' },
          email: { type: 'string', format: 'email', example: 'james.carter@example.com' },
          phone: { type: 'string', example: '+44 7700 900000' },
          serviceId: {
            type: 'string',
            enum: ['electricals', 'plumbing', 'reactive-maintenance', 'facilities-management', 'security', 'commercial-cleaning', 'catering', 'aviation', 'concierge', 'parking-lot-management', 'rail-facilities'],
            nullable: true,
          },
          propertyType: {
            type: 'string',
            enum: ['commercial', 'industrial', 'mixed-use', 'other'],
            nullable: true,
          },
          urgency: {
            type: 'string',
            enum: ['emergency', 'within-a-week', 'planning-ahead'],
            nullable: true,
          },
          message: { type: 'string', minLength: 1, maxLength: 2000, example: 'We need a full electrical survey for our office block.' },
          sourcePage: { type: 'string', maxLength: 200, example: '/hard-services/electricals' },
          companyWebsite: { type: 'string', maxLength: 200, description: 'Honeypot — leave empty. Any value triggers silent discard.' },
          agreedToPrivacyPolicy: { type: 'boolean', enum: [true] },
        },
      },
      Enquiry: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          serviceId: { type: 'string', nullable: true },
          propertyType: { type: 'string', nullable: true },
          urgency: { type: 'string', nullable: true },
          message: { type: 'string' },
          sourcePage: { type: 'string' },
          status: { type: 'string', enum: ['new', 'contacted', 'quoted', 'won', 'lost'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          roleAppliedFor: { type: 'string' },
          coverLetter: { type: 'string' },
          status: { type: 'string', enum: ['new', 'reviewing', 'interview', 'offered', 'rejected'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@atlassouthes.com' },
          password: { type: 'string', minLength: 8, example: '••••••••••••' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'Short-lived JWT (15 min). Store in memory only — never localStorage.' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', minLength: 8 },
          newPassword: { type: 'string', minLength: 12, description: 'Minimum 12 characters. Must differ from current password.' },
        },
      },
      ContentPage: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'home' },
          publishedData: { type: 'object', description: 'The live content payload — shape varies per page type.' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      StatsResponse: {
        type: 'object',
        properties: {
          enquiriesThisWeek: { type: 'integer', example: 14 },
          enquiriesThisMonth: { type: 'integer', example: 52 },
          conversionRate: { type: 'number', format: 'float', example: 23.5, description: 'Percentage of enquiries marked won.' },
          topPages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: '/hard-services/plumbing' },
                views: { type: 'integer', example: 842 },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid credentials' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Public'],
        summary: 'Health check',
        description: 'Returns `ok` and the current server timestamp. Used by Render for uptime monitoring.',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'API is healthy',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } },
          },
        },
      },
    },
    '/api/enquiries': {
      post: {
        tags: ['Public'],
        summary: 'Submit an enquiry / quote request',
        description: 'Validates the submission, checks the honeypot field, persists the enquiry, and fires confirmation + admin notification emails. Rate-limited to 5 requests per 10 minutes per IP.',
        operationId: 'createEnquiry',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EnquiryCreate' } } },
        },
        responses: {
          201: {
            description: 'Enquiry created (or silently discarded if honeypot was filled)',
            content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, id: { type: 'string', format: 'uuid' } } } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded' },
          503: { description: 'Database not yet configured' },
        },
      },
    },
    '/api/events/page-view': {
      post: {
        tags: ['Public'],
        summary: 'Record a page-view analytics event',
        description: 'Lightweight event sink for page-view telemetry. Used by the frontend on every route change.',
        operationId: 'recordPageView',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['path'],
                properties: {
                  path: { type: 'string', example: '/hard-services/electricals' },
                  referrer: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event recorded' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/content/{slug}': {
      get: {
        tags: ['Public'],
        summary: 'Get published page content',
        description: 'Returns the `publishedData` for the given CMS slug. Cached for 5 minutes (`Cache-Control: public, max-age=300`).',
        operationId: 'getContent',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            examples: {
              home: { value: 'home' },
              plumbing: { value: 'plumbing' },
              corporate: { value: 'industries/corporate' },
            },
          },
        ],
        responses: {
          200: {
            description: 'Page content',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentPage' } } },
          },
          404: { description: 'Slug not found' },
        },
      },
    },
    '/api/careers/apply': {
      post: {
        tags: ['Public'],
        summary: 'Submit a job application',
        description: 'Persists a job application and notifies the admin team. Honeypot-protected.',
        operationId: 'submitApplication',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'phone', 'roleAppliedFor', 'agreedToPrivacyPolicy'],
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  roleAppliedFor: { type: 'string' },
                  coverLetter: { type: 'string', nullable: true },
                  agreedToPrivacyPolicy: { type: 'boolean', enum: [true] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Application submitted' },
          400: { description: 'Validation error' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/admin/auth/login': {
      post: {
        tags: ['Admin — Auth'],
        summary: 'Admin login',
        description: 'Validates credentials, returns a short-lived JWT access token in the response body, and sets an httpOnly SameSite=Strict refresh token cookie (7 days). Rate-limited to 5 attempts per 15 minutes per IP. Accounts are locked for 1 hour after 10 failed attempts.',
        operationId: 'adminLogin',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          401: { description: 'Invalid credentials or account locked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many login attempts' },
        },
      },
    },
    '/api/admin/auth/refresh': {
      post: {
        tags: ['Admin — Auth'],
        summary: 'Silently refresh access token',
        description: 'Exchanges the httpOnly refresh-token cookie for a fresh access token. Called automatically by `AuthContext` on page load and on 401 responses.',
        operationId: 'adminRefresh',
        responses: {
          200: {
            description: 'New access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          401: { description: 'Refresh token missing, expired, or revoked' },
        },
      },
    },
    '/api/admin/auth/logout': {
      post: {
        tags: ['Admin — Auth'],
        summary: 'Logout',
        description: 'Clears the httpOnly refresh-token cookie server-side. The client discards the in-memory access token.',
        operationId: 'adminLogout',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out' },
        },
      },
    },
    '/api/admin/enquiries': {
      get: {
        tags: ['Admin — Enquiries'],
        summary: 'List all enquiries',
        description: 'Returns up to 100 enquiries ordered by `createdAt` descending.',
        operationId: 'listEnquiries',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Array of enquiries',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Enquiry' } } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/enquiries/{id}': {
      get: {
        tags: ['Admin — Enquiries'],
        summary: 'Get a single enquiry',
        operationId: 'getEnquiry',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Enquiry detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Enquiry' } } } },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Admin — Enquiries'],
        summary: 'Update enquiry status',
        description: 'Updates the pipeline status and writes an audit log entry.',
        operationId: 'updateEnquiryStatus',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['new', 'contacted', 'quoted', 'won', 'lost'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated enquiry', content: { 'application/json': { schema: { $ref: '#/components/schemas/Enquiry' } } } },
          400: { description: 'Invalid status' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/applications': {
      get: {
        tags: ['Admin — Applications'],
        summary: 'List all job applications',
        operationId: 'listApplications',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Array of applications',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Application' } } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/applications/{id}': {
      patch: {
        tags: ['Admin — Applications'],
        summary: 'Update application status',
        operationId: 'updateApplicationStatus',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['new', 'reviewing', 'interview', 'offered', 'rejected'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated application' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['Admin — Stats'],
        summary: 'Dashboard KPI stats',
        description: 'Returns enquiry counts (week / month), conversion rate, and top pages by view count.',
        operationId: 'getStats',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Stats object',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/analytics/page-views': {
      get: {
        tags: ['Admin — Analytics'],
        summary: 'Page-view time series',
        description: 'Returns daily page-view counts for the past N days.',
        operationId: 'getPageViews',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 30, minimum: 1, maximum: 365 } },
        ],
        responses: {
          200: {
            description: 'Time series data',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', format: 'date' },
                      views: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/users/change-password': {
      post: {
        tags: ['Admin — Users'],
        summary: 'Change own password',
        description: 'Verifies current password, hashes the new one, increments `tokenVersion` (which immediately invalidates all active sessions), and writes an audit log entry.',
        operationId: 'changePassword',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
        },
        responses: {
          200: { description: 'Password changed. All other sessions are now invalidated.' },
          400: { description: 'Validation error or password reuse attempt' },
          401: { description: 'Current password incorrect or unauthorized' },
        },
      },
    },
    '/api/admin/content': {
      get: {
        tags: ['Admin — Content'],
        summary: 'List all CMS pages',
        operationId: 'listContent',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Array of content pages (slug + metadata, no full payload)',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ContentPage' } } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/content/{slug}': {
      get: {
        tags: ['Admin — Content'],
        summary: 'Get a single CMS page (draft + published)',
        operationId: 'getContentPage',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Full content page including draftData and publishedData',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentPage' } } },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Admin — Content'],
        summary: 'Update and publish a CMS page',
        description: 'Saves changes to `draftData` and atomically promotes them to `publishedData`.',
        operationId: 'updateContentPage',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: { type: 'object', description: 'Full content payload — shape matches the page type.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated content page' },
          401: { description: 'Unauthorized' },
          404: { description: 'Slug not found' },
        },
      },
    },
  },
};

/**
 * Custom CSS overrides — maps Atlas South brand tokens to Swagger UI's CSS variables
 * so the docs page looks like it belongs to the same product.
 *
 * Brand: Navy #002484 · AccentBlue #0062D6 · White #FFFFFF
 */
export const swaggerCustomCss = `
  /* ── Top bar ─────────────────────────────────────────────── */
  .swagger-ui .topbar {
    background-color: #002484;
    border-bottom: 3px solid #0062D6;
    padding: 10px 0;
  }
  .swagger-ui .topbar .download-url-wrapper { display: none; }
  .swagger-ui .topbar-wrapper { align-items: center; gap: 12px; }
  .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; gap: 10px; }
  .swagger-ui .topbar-wrapper img { display: none; }
  .swagger-ui .topbar-wrapper .link::before {
    content: 'Atlas South API';
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* ── Info block ──────────────────────────────────────────── */
  .swagger-ui .info .title { color: #002484; font-weight: 800; }
  .swagger-ui .info a { color: #0062D6; }
  .swagger-ui .info li, .swagger-ui .info p, .swagger-ui .info table { color: #374151; }

  /* ── Tag headings ────────────────────────────────────────── */
  .swagger-ui .opblock-tag {
    border-bottom: 2px solid #E5E7EB;
    color: #002484;
    font-weight: 700;
  }
  .swagger-ui .opblock-tag:hover { background: #EFF6FF; }
  .swagger-ui .opblock-tag-section h3 { color: #002484; }

  /* ── Operation blocks ────────────────────────────────────── */
  .swagger-ui .opblock.opblock-get    { border-color: #0062D6; background: #EFF6FF; }
  .swagger-ui .opblock.opblock-post   { border-color: #16A34A; background: #F0FDF4; }
  .swagger-ui .opblock.opblock-patch  { border-color: #D97706; background: #FFFBEB; }
  .swagger-ui .opblock.opblock-put    { border-color: #9333EA; background: #FAF5FF; }
  .swagger-ui .opblock.opblock-delete { border-color: #DC2626; background: #FEF2F2; }

  .swagger-ui .opblock.opblock-get    .opblock-summary-method { background: #0062D6; }
  .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #16A34A; }
  .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #D97706; }
  .swagger-ui .opblock.opblock-put    .opblock-summary-method { background: #9333EA; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #DC2626; }

  .swagger-ui .opblock-summary { border-color: transparent !important; }
  .swagger-ui .opblock-summary-path { color: #002484; font-weight: 600; }
  .swagger-ui .opblock-summary-description { color: #6B7280; }

  /* ── Buttons ─────────────────────────────────────────────── */
  .swagger-ui .btn.authorize {
    color: #0062D6;
    border-color: #0062D6;
    font-weight: 600;
  }
  .swagger-ui .btn.authorize svg { fill: #0062D6; }
  .swagger-ui .btn.authorize:hover { background: #EFF6FF; }

  .swagger-ui .btn.execute {
    background-color: #0062D6;
    border-color: #0062D6;
    color: #FFFFFF;
    font-weight: 600;
  }
  .swagger-ui .btn.execute:hover { background-color: #002484; border-color: #002484; }

  .swagger-ui .btn.cancel { border-color: #9CA3AF; color: #6B7280; }
  .swagger-ui .btn.btn-clear { border-color: #9CA3AF; color: #6B7280; }

  /* ── Inputs / Select ─────────────────────────────────────── */
  .swagger-ui input[type=text],
  .swagger-ui input[type=password],
  .swagger-ui input[type=search],
  .swagger-ui textarea,
  .swagger-ui select {
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 6px 10px;
  }
  .swagger-ui input[type=text]:focus,
  .swagger-ui input[type=password]:focus,
  .swagger-ui textarea:focus {
    border-color: #0062D6;
    outline: 2px solid rgba(0,98,214,0.25);
  }

  /* ── Response blocks ─────────────────────────────────────── */
  .swagger-ui .response-col_status { color: #002484; font-weight: 700; }
  .swagger-ui table.responses-table .response-col_links { color: #0062D6; }

  /* ── Models section ──────────────────────────────────────── */
  .swagger-ui section.models { border: 1px solid #E5E7EB; border-radius: 8px; }
  .swagger-ui section.models h4 { color: #002484; }
  .swagger-ui .model-toggle:after { background-color: #0062D6; }

  /* ── Server selector ─────────────────────────────────────── */
  .swagger-ui .scheme-container { background: #F9FAFB; box-shadow: none; border-bottom: 1px solid #E5E7EB; padding: 12px 0; }
  .swagger-ui .servers > label { color: #374151; font-weight: 600; }
  .swagger-ui .servers select { border-color: #D1D5DB; }

  /* ── Misc ────────────────────────────────────────────────── */
  .swagger-ui .markdown p, .swagger-ui .renderedMarkdown p { color: #374151; }
  .swagger-ui .markdown code, .swagger-ui .renderedMarkdown code {
    background: #F3F4F6;
    color: #002484;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.85em;
  }
  .swagger-ui .parameter__name { color: #002484; font-weight: 600; }
  .swagger-ui .parameter__type { color: #0062D6; }
  .swagger-ui .prop-type { color: #0062D6; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
`;

export const swaggerUiOptions = {
  customCss: swaggerCustomCss,
  customSiteTitle: 'Atlas South API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: { activate: true, theme: 'arta' },
    tryItOutEnabled: true,
  },
};
