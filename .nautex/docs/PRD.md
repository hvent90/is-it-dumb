#  Product Specification
## [PRD-1] Introduction & Vision
This document outlines the requirements for a web application named "Is It Dumb", designed to track and aggregate user-reported issues with Large Language Models (LLMs). The product's vision is to become the definitive source for understanding the real-time, crowd-sourced performance and sentiment of popular LLMs, similar to how "downforeveryoneorjustme.com" serves as a status checker for websites.The core problem being addressed is the lack of a centralized platform for users to verify if their negative experience with an LLM (e.g., performance degradation, increased hallucinations) is an isolated incident or a widespread issue. By collecting and analyzing user reports, the application will provide valuable insights into the operational status and perceived quality of various models. The primary goal is to empower developers, product managers, and researchers with timely data to diagnose problems and make informed decisions.

## [PRD-2] Target Audience & User Personas
The primary users of this application are professionals who build with or rely on LLMs for their work.

[PRD-3] Persona: The Developer / Engineer 

[PRD-4] Role: Builds applications that integrate with LLMs. 

[PRD-5] Motivation: When their application malfunctions, they need to quickly determine if the root cause is their own code or an issue with the underlying LLM. 

[PRD-6] Goal: Use the platform to check if a specific model is experiencing a known, widespread problem, saving significant debugging time. 

[PRD-7] Persona: The Product Manager (PM) 

[PRD-8] Role: Manages a product that utilizes LLM technology. 

[PRD-9] Motivation: Needs to understand user sentiment and track the performance of the LLMs their product depends on. 

[PRD-10] Goal: Use the platform's trending data to correlate their own product's user complaints with broader issues in the LLM ecosystem, and to stay ahead of potential problems. 

## [PRD-11] User Stories / Use Cases
### [PRD-12] Search and Reporting
[PRD-13] As a developer, I want to search for a specific LLM to see if others are reporting issues, so that I can quickly validate my hypothesis that the model is the source of a problem. 

[PRD-14] As a user, I want the search bar to suggest common model names as I type, so that I can find the model I'm looking for faster. 

[PRD-15] As a user experiencing a problem, I want to submit a quick, free-text description of the issue at the same time I search for a model, so that I can report my problem with minimal effort. 

[PRD-16] As a user with a detailed issue, I want to optionally provide more structured feedback (like issue type, severity, and example prompts), so that I can contribute higher-quality data for analysis. 

### [PRD-17] Analytics and Insights
[PRD-18] As a product manager, I want to view a high-level dashboard of trending issues across all major LLMs, so that I can stay informed about the overall health of the ecosystem. 

[PRD-19] As an engineer, I want to click on a specific model from the trending list to see a detailed breakdown of its reported issues over time, so that I can understand the history and nature of its problems. 

[PRD-20] As a product manager, I want to be able to filter the dashboard by time range and model family, so that I can focus my analysis on the data that is most relevant to me. 

[PRD-21] As a user, I want to see dynamically generated summaries of what other users are saying about a model's issues, so that I can quickly grasp the main problems without reading every single report. 

[PRD-22] As an analyst, I want to click on an issue category (e.g., "Hallucinations") to see which models are most affected, so that I can compare models on specific performance vectors. 

[PRD-133] As a developer, I want to see system-generated performance scores alongside user reports, so I can correlate user-perceived issues with potential provider-side throttling or quality degradation. 

## [PRD-23] Functional Requirements
### [PRD-24] Landing Page and Search
[PRD-25] The application's main page shall feature two primary sections presented as tabs: "Search" and "Trending Overview". 

[PRD-26] The "Search" tab shall be the default view presented to the user upon visiting the site. 

[PRD-27] The "Search" view must contain a search bar with a clear call to action, such as "Which model are you checking on?". 

[PRD-28] The search bar must provide autocomplete suggestions for common LLM names to facilitate easy selection. 

[PRD-29] The system shall interpret a user searching for a model as a signal of a potential issue with that model. 

[PRD-30] Every search for a model must be logged as a "search event". 

### [PRD-31] Data Collection for Events
For each search event and report, the system must capture the following information.

#### [PRD-32] Required Information
[PRD-33] The timestamp of when the event occurred. 

[PRD-34] The name of the LLM being searched or reported on. 

#### [PRD-35] Automatically Captured Metadata
[PRD-36] The user's approximate geographical location (city, region, country), derived from their IP address. 

[PRD-37] The user's browser, operating system, and device type (desktop vs. mobile), derived from the User Agent string. 

[PRD-38] A session identifier or anonymous user token to correlate multiple actions from the same user within a single session. 

#### [PRD-39] User Context
[PRD-40] The system must log how the user initiated the action (e.g., via the Search tab versus clicking on an item in the Overview tab). 

[PRD-41] The system shall capture the user's "product context" (e.g., using a model via its native website vs. through an integrated product) within the Expanded Detailed Report form. This approach prioritizes a low-friction initial reporting experience. 

### [PRD-42] Issue Reporting System
The system shall provide a two-tiered approach for users to report issues.

#### [PRD-43] Quick Report
[PRD-44] A user must be able to submit a report by providing a free-text description of their issue. 

[PRD-45] This functionality shall be presented inline with the search action to ensure a low-friction reporting process. 

#### [PRD-46] Expanded Detailed Report
[PRD-47] A user must have the option to expand the quick report interface to provide additional, structured details. 

[PRD-48] This transition must be seamless, occurring inline on the same page without requiring navigation. 

[PRD-49] The expanded form must pre-populate any information already provided in the quick report (e.g., the free-text description). 

[PRD-50] The expanded form must include fields for: 

[PRD-51] Pre-defined issue categories (e.g., Hallucination, Memory, Reliability, UI). 

[PRD-52] The severity or frequency of the issue. 

[PRD-53] Example prompts or conversation transcripts that demonstrate the issue. 

[PRD-54] Additional context about how the model was being used. This field shall provide a list of common options (e.g., 'Direct API', 'Native Website', 'Integrated Product') and include a free-text 'Other' option for custom input. 

[PRD-55] The system must treat the quick and expanded reports as a single, unified issue submission. 

### [PRD-56] Trending Overview Dashboard
[PRD-57] The application must feature a "Trending Overview" page that displays aggregated data from all user reports. 

[PRD-58] The dashboard must be interactive, allowing users to explore the data. 

[PRD-59] The dashboard shall include the following components: 

[PRD-60] A ranked list or chart of the most frequently reported-on models. 

[PRD-61] A visualization (e.g., pie or donut chart) showing the distribution of issue categories across all reports. 

[PRD-62] A section highlighting trending issue clusters identified through semantic analysis of report descriptions. 

[PRD-63] The dashboard must support filtering by: 

[PRD-64] Time range (e.g., last 24 hours, last 7 days, last 30 days, custom). 

[PRD-65] Model family (e.g., GPT-4, GPT-5, Claude, Gemini). 

[PRD-66] User context (e.g., direct API usage, specific product integrations). 

### [PRD-67] Interactive Drill-Down Views
[PRD-68] Users must be able to click on elements within the Trending Overview dashboard to navigate to more detailed views. 

[PRD-69] Any active filters on the main dashboard must persist when navigating to a drill-down view. 

#### [PRD-70] Model Detail View
[PRD-71] This view is accessed by clicking on a specific model's name. 

[PRD-72] It must display a time-series graph showing the trend of reports for that model. 

[PRD-73] It must provide a breakdown of the types of issues reported for that model. 

[PRD-74] It must show representative, anonymized user queries and report descriptions associated with the model's issues. 

#### [PRD-75] Issue Category Detail View
[PRD-76] This view is accessed by clicking on a segment of the issue categories chart. 

[PRD-77] It must display a list of the models most affected by that specific issue. 

[PRD-78] It must show a time-series graph illustrating the trend of that issue category across all models. 

[PRD-79] It must feature representative, anonymized user reports that fall into that category. 

#### [PRD-80] Chart and Data Interaction
[PRD-81] Hovering over data points on any time-series chart must display a tooltip with details (e.g., report counts, percentage change). 

[PRD-82] Clicking on a time window within a trend graph shall update the dashboard to focus on that selected period. 

[PRD-83] A panel displaying representative user reports must be available, with the ability to expand and scroll through more anonymized samples. 

### [PRD-84] Report Analysis
[PRD-85] The system must analyze the free-text descriptions from user reports to identify and group them by semantic similarity. 

[PRD-86] This analysis shall be used to dynamically identify new or emerging types of issues not covered by predefined categories. 

[PRD-87] The system shall allow these dynamically generated clusters to be mapped to known categories for standardized reporting. 

### [PRD-128] Automated Quality Evaluation (Mock)
This section outlines the requirements for a simulated system that mimics automated quality checks on LLMs.

[PRD-129] The system shall display data points representing simulated, regular evaluations of LLM performance. This is to model the detection of issues like quality degradation from serving quantized models during peak traffic. 

[PRD-130] This functionality is to be implemented as a frontend-only mock. No actual backend evaluation infrastructure will be built. 

[PRD-131] The mocked evaluation results shall be integrated into the 'Trending Overview Dashboard' and the 'Model Detail View', presented alongside user-submitted report data. 

[PRD-132] The presentation must clearly differentiate between the simulated automated data and genuine user reports, using distinct labels and visual cues to prevent user confusion. 

## [PRD-88] Non-Functional Requirements (Business Perspective)
### [PRD-89] Usability
[PRD-90] The primary user flow of searching for a model and submitting a quick report must be exceptionally simple and require minimal user effort. 

[PRD-91] The data visualizations and dashboards must be intuitive and easily understood by the target audience of PMs and engineers. 

### [PRD-92] Reliability
[PRD-93] Given the context of a take-home assignment, the system will be provided with best-effort availability. High availability (e.g., 99.9% uptime) is not a requirement for the initial implementation. 

### [PRD-94] Performance
[PRD-95] The Trending Overview dashboard must reflect new user reports in near real-time. 

[PRD-96] User interactions on the site, such as search autocomplete, filtering, and navigating to drill-down views, should feel instantaneous to the user. 

### [PRD-97] Security and Privacy
[PRD-98] All user-submitted data, especially potentially sensitive information in prompts or transcripts, must be handled securely. 

[PRD-99] Personally Identifiable Information (PII) such as IP addresses must not be displayed publicly and should only be used for aggregated, anonymized analytics (e.g., regional trends). 

### [PRD-100] Compliance
[PRD-101] Specific data privacy regulations (e.g., GDPR/CCPA) are not in scope for the initial implementation, aligning with the minimal scope of a take-home assignment. The system will adhere to general best practices for security and privacy. 

## [PRD-102] Scope
### [PRD-103] In Scope
[PRD-104] A public-facing web application for searching and viewing LLM issue status. 

[PRD-105] Logging of model search events and associated metadata (GeoIP, User Agent). 

[PRD-106] A two-tiered issue reporting system (quick free-text and optional expanded form). 

[PRD-107] An interactive analytics dashboard showing trending models and issue types. 

[PRD-108] Filterable and drill-down views for detailed analysis by model and issue category. 

[PRD-109] Semantic clustering of user-submitted free-text reports. 

[PRD-134] A frontend mock to display simulated automated LLM quality evaluation results. 

### [PRD-110] Out of Scope
[PRD-111] User authentication, accounts, and profiles. All interactions will be anonymous. 

[PRD-112] Direct, automated testing of LLM APIs to verify performance. The system relies solely on user-submitted reports. 

[PRD-113] To maintain a minimal scope for the initial release, moderation and anti-spam features are out of scope. Basic abuse prevention (e.g., rate-limiting) can be considered a stretch goal but is not a firm requirement. 

## [PRD-114] Success Metrics
[PRD-116] Engagement Metrics: Focus on user interaction, such as Daily Active Users (DAU), number of model searches per day, and number of reports submitted per day. 

[PRD-117] Data Quality Metrics: Focus on the value of the collected data, such as the conversion rate from quick to detailed reports and the signal-to-noise ratio in submitted reports. 

## [PRD-119] Assumptions & Dependencies
### [PRD-120] Assumptions
[PRD-121] Users are willing to take the time to report issues they encounter with LLMs. 

[PRD-122] The act of a user searching for a model is a reasonably strong indicator of a potential problem. 

[PRD-123] The volume of user reports will be sufficient to generate statistically meaningful trends. 

[PRD-124] An anonymous reporting system can provide valuable data without requiring user accounts. 

### [PRD-125] Dependencies
[PRD-126] The accuracy of location-based analytics is dependent on the reliability of an external GeoIP lookup service. 

[PRD-127] The effectiveness of identifying issue trends is dependent on the quality of the semantic analysis and clustering capabilities. 

## [PRD-136] Architecture & Technology Stack
### [PRD-135] Technology Stack
The application has been migrated to a pure Next.js framework, unifying the frontend and backend development within a single project. This replaces the previous technology stack which was a combination of Next.js and Hono.

### [PRD-137] Project Structure
The codebase is organized in a standard project structure with all application code located in the ~/src directory. This is a change from the previous monorepo structure where the frontend code was located in ~/app/frontend.
