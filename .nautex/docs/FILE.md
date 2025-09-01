Document: Files Tree [FILE]
  └── Files Tree
      ├── README.md                               // Contains project overview for 'Is It Dumb', setup, and deployment instructions.
      ├── next.config.js                          // Configuration options for the Next.js application.
      ├── tailwind.config.ts                      // Configures Tailwind CSS, including theme and plugins.
      ├── postcss.config.js                       // Configuration for PostCSS, used by Tailwind CSS.
      ├── package.json                            // Defines project dependencies and scripts for the Next.js application.
      ├── tsconfig.json                           // Manages TypeScript settings for the project.
      ├── components.json                         // Specifies configuration for the shadcn UI component library.
      ├── vercel.json                             // Configures Vercel deployments and scheduled jobs.
      ├── .gitignore                              // Specifies files and directories to be ignored by version control.
      ├── public                                  // Contains static assets like images and fonts.
      ├── src                                     // Main source code directory for the web application.
      │   ├── app                                 // Contains all pages, layouts, and API routes.
      │   │   ├── layout.tsx                      // Defines the root layout, including theme and font setup.
      │   │   ├── page.tsx                        // Renders the main page with Search and Trending tabs.
      │   │   ├── model                           // Contains the dynamic route for model-specific views.
      │   │   │   └── [modelName]                 // Catches dynamic segments for model names.
      │   │   │       └── page.tsx                // Renders the detailed analytics for a specific LLM.
      │   │   ├── issue                           // Contains the dynamic route for issue category views.
      │   │   │   └── [category]                  // Catches dynamic segments for issue category names.
      │   │   │       └── page.tsx                // Renders detailed analytics for a specific issue category.
      │   │   ├── api                             // Contains serverless functions for the backend.
      │   │   │   └── ingest                      // Route handler for the data ingestion endpoint.
      │   │   │       └── route.ts                // Handles event validation, enrichment, and forwarding to Tinybird.
      │   │   └── cron                            // Contains serverless functions triggered on a schedule.
      │   │       └── cluster                     // Contains the scheduled job for semantic clustering.
      │   │           └── route.ts                // Fetches reports, generates embeddings, and saves clusters.
      │   ├── components                          // Contains reusable UI components for the application.
      │   │   ├── ui                              // Directory for auto-generated shadcn UI components.
      │   │   ├── ModelSearchInput.tsx            // Implements the model search input with autocomplete.
      │   │   ├── DetailedReportForm.tsx          // Implements the detailed report form component.
      │   │   ├── AnalyticsChart.tsx              // Provides a themed wrapper for various chart types.
      │   │   ├── FilterControls.tsx              // Implements the filter controls for the analytics dashboard.
      │   │   ├── DashboardGrid.tsx               // Implements the grid layout for the Trending Overview page.
      │   │   └── ModelEvalChart.tsx
      │   ├── lib                                 // Contains helper functions, hooks, and API clients.
      │   │   ├── utils.ts                        // Contains shared utility functions, like `cn` for class names.
      │   │   ├── api-client.ts                   // Manages API requests from the frontend to backend services.
      │   │   └── mock-evals.ts
      │   ├── styles                              // Contains global CSS and styling-related files.
      │   │   └── globals.css                     // Defines global styles, fonts, and CSS themes.
      │   └── types                               // Holds shared data models and TypeScript interfaces.
      │       └── index.ts                        // Implements shared TypeScript interfaces for system events.
      ├── tinybird                                // Contains all Infrastructure-as-Code files for Tinybird.
      │   ├── .tinyb                              // Configuration file for the Tinybird CLI.
      │   ├── datasources                         // Defines the schemas for data tables in Tinybird.
      │   │   ├── llm_events.datasource           // Defines the `llm_events` table schema in Tinybird.
      │   │   └── report_clusters.datasource      // Defines the `report_clusters` table schema in Tinybird.
      │   └── pipes                               // Defines the API endpoints published by Tinybird.
      │       ├── get_trending_models.pipe        // SQL query to get the most frequently reported models.
      │       ├── get_issue_distribution.pipe     // SQL query to get the distribution of issue categories.
      │       ├── get_model_details.pipe          // SQL query to get detailed analytics for a specific model.
      │       └── get_issue_category_details.pipe     // SQL query for analytics on a specific issue category.
      └── tests                                   // Contains all automated tests for the project.
          └── e2e                                 // Contains end-to-end tests using Playwright.
              ├── reporting.spec.ts               // Tests the user flow of submitting a new issue report.
              └── dashboard.spec.ts               // Tests the functionality of the analytics dashboard.