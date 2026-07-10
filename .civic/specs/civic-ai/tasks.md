# Implementation Tasks

## Task 1: Project Scaffolding and Configuration

- [ ] 1.1 Initialise the `server` directory as a Node.js project: `npm init -y`, install core dependencies (`express`, `mongoose`, `dotenv`, `cors`, `helmet`, `express-rate-limit`, `bcrypt`, `jsonwebtoken`, `multer`, `sharp`, `cloudinary`, `nodemailer`, `node-cron`, `@tanstack/react-query`).
- [ ] 1.2 Initialise the `client` directory as a Vite + React project with Tailwind CSS configured.
- [ ] 1.3 Create `.env` files for both `server` and `client` with all required environment variables (see design.md Environment Configuration section).
- [ ] 1.4 Set up the Express app entry point (`server/src/index.js`) with middleware stack: helmet, cors, rate-limiter, json body parser, and static file serving.
- [ ] 1.5 Connect to MongoDB using Mongoose and add a `2dsphere` index on `Report.location`.
- [ ] 1.6 Create folder structure: `server/src/{routes,controllers,models,middleware,services,utils}`.

---

## Task 2: Database Models

- [ ] 2.1 Create `User` Mongoose model with all fields from design.md (roles enum, reputationScore, failedLoginAttempts, isLocked).
- [ ] 2.2 Create `Report` Mongoose model with GeoJSON `location` field, `statusHistory` array, `photoEmbedding` array, and all enums.
- [ ] 2.3 Create `Department` Mongoose model with `issueTypes` array and optional `jurisdictionBounds` GeoJSON polygon.
- [ ] 2.4 Create `Prediction` Mongoose model with centroid GeoJSON point and riskRating enum.
- [ ] 2.5 Create `Notification` Mongoose model for in-app notifications (`userId`, `reportId`, `message`, `read`, `createdAt`).

---

## Task 3: Authentication

- [ ] 3.1 Implement `POST /api/auth/register` — validate input, hash password with bcrypt (12 rounds), create User document, return JWT.
- [ ] 3.2 Implement `POST /api/auth/login` — verify credentials, check account lock, increment `failedLoginAttempts` on failure, issue JWT + refresh token httpOnly cookie on success.
- [ ] 3.3 Implement `POST /api/auth/logout` — clear refresh token cookie.
- [ ] 3.4 Write `authMiddleware.js` — verify RS256 JWT from Authorization header, attach `req.user`.
- [ ] 3.5 Write `roleGuard.js` middleware — accept `roles[]` param, return 403 if `req.user.role` not in list.
- [ ] 3.6 Implement account lockout: after 5 consecutive failures lock account and send unlock email via Nodemailer.

---
## Task 4: Report Submission (Citizen)

- [ ] 4.1 Implement `POST /api/reports` route with multer middleware for multipart file upload.
- [ ] 4.2 Validate: photo size ≤20MB, GPS coordinates within valid bounds (lat ±90°, lon ±180°).
- [ ] 4.3 Use `sharp` to compress and convert image to JPEG quality 85.
- [ ] 4.4 Upload compressed image to Cloudinary with retry logic (3 attempts, exponential backoff).
- [ ] 4.5 Save `photoUrl` and initial Report document to MongoDB (status: 'submitted').
- [ ] 4.6 Return unique Report `_id` to the client.

---

## Task 5: AI Classification Service

- [ ] 5.1 Create `services/classifier.js` — send image URL to OpenAI GPT-4o Vision with structured prompt requesting `{ issueType, confidence }`.
- [ ] 5.2 Handle response: parse issueType from taxonomy, parse confidence (0–1), fallback to `{ issueType: 'other', confidence: 0.0 }` on error.
- [ ] 5.3 If confidence < 0.6, trigger a confirmation flow: set Report status to 'pending_confirmation' and return flag to frontend.
- [ ] 5.4 On confirmation flow completion (citizen corrects issueType), update Report document and continue pipeline.
- [ ] 5.5 Attach `issueType` and `classificationConfidence` to the Report document.

---

## Task 6: Severity Estimation Service

- [ ] 6.1 Create `services/severityEstimator.js` — call OpenAI Vision API with prompt: "Given this infrastructure issue image and type `{issueType}`, rate severity as low/medium/high/critical with reasoning."
- [ ] 6.2 Parse severity level from response, update `report.severityLevel`.
- [ ] 6.3 Severity estimation runs automatically after classification completes.

---

## Task 7: Department Routing Service

- [ ] 7.1 Create `services/departmentRouter.js` — look up Department by `issueType` in `department.issueTypes` array.
- [ ] 7.2 If multiple departments match issueType, filter by `jurisdictionBounds` using MongoDB `$geoWithin` query on Report location.
- [ ] 7.3 If no department matches, assign to default "General" department and flag Report for manual review (`needsManualReview: true`).
- [ ] 7.4 Attach `department` ObjectId to Report document.

---

## Task 8: Duplicate Detection Service

- [ ] 8.1 Create `services/embeddingService.js` — generate text embedding from issueType + summary using OpenAI `text-embedding-3-small`.
- [ ] 8.2 Store embedding in `report.photoEmbedding` array (1536 dimensions).
- [ ] 8.3 Create `services/duplicateDetector.js` — query all open Reports within 100m radius using MongoDB `$geoNear`.
- [ ] 8.4 Compute cosine similarity between new Report embedding and all candidates; if similarity > `DUPLICATE_THRESHOLD` (env var, default 0.85), mark as duplicate.
- [ ] 8.5 Link duplicate Report to original (`report.duplicateOf = originalReportId`, `report.isDuplicate = true`), increment `originalReport.duplicateCount`.
- [ ] 8.6 Send notification to citizen: "Your report has been linked to an existing issue #`{originalId}`."
- [ ] 8.7 Ensure duplicate detection completes within 10 seconds.

---

## Task 9: AI Report Summarisation Service

- [ ] 9.1 Create `services/summariser.js` — call GPT-4o with prompt: "Summarise this civic issue report in ≤100 words: Type: `{issueType}`, Severity: `{severity}`, Location: `{address}`, Details: `{any citizen description}`."
- [ ] 9.2 Parse response and store in `report.aiSummary`.
- [ ] 9.3 Summariser runs automatically after classification and severity estimation.

---

## Task 10: Citizen Report Tracking

- [ ] 10.1 Implement `GET /api/reports/mine` route (requires auth + citizen role) — return all Reports where `submittedBy === req.user._id`.
- [ ] 10.2 Include full `statusHistory` array in response.
- [ ] 10.3 Implement `GET /api/reports/:id` route — return single Report detail with all fields (photo, status, aiSummary, location, statusHistory).
- [ ] 10.4 Frontend: create `CitizenDashboard` component displaying report cards with status badges.
- [ ] 10.5 Frontend: create `ReportDetail` component showing photo, map marker, status timeline, and resolution notes if resolved.

---

## Task 11: Notification System

- [ ] 11.1 Create `services/notificationService.js` — exposes `sendInAppNotification(userId, reportId, message)` and `sendEmailNotification(email, subject, body)`.
- [ ] 11.2 Hook into Report status change events (use EventEmitter pattern in `updateReportStatus` controller).
- [ ] 11.3 On status change, create Notification document and send email if user has `notificationEmail` set.
- [ ] 11.4 Implement `GET /api/notifications/mine` — return all unread notifications for current user.
- [ ] 11.5 Frontend: poll `/api/notifications/mine` every 30s, display count badge in navbar, toast on new notification.

---
## Task 12: Authority Dashboard and Issue Management

- [ ] 12.1 Implement `GET /api/reports` route (authority/admin) — filter by `department`, `issueType`, `severityLevel`, `status`, date range; sort by `severityLevel` Critical first by default; return within 2s.
- [ ] 12.2 Implement `PATCH /api/reports/:id/status` — update status, record in `statusHistory` with `changedBy`, `changedAt`, `notes`; trigger notification service.
- [ ] 12.3 Implement `PATCH /api/reports/:id/reassign` — update `department`, record reassignment in `statusHistory` with reason.
- [ ] 12.4 Frontend: create `AuthorityDashboard` page with filterable, sortable report table, severity colour badges, and citizen reputation score column.
- [ ] 12.5 Frontend: create `AuthorityReportDetail` component with status update form, resolution notes input, and reassign department dropdown.

---

## Task 13: Map Visualisation and Heatmap

- [ ] 13.1 Install `react-leaflet`, `leaflet`, `leaflet.heat`, `leaflet.markercluster` in the client.
- [ ] 13.2 Implement `GET /api/heatmap/data` — return array of `[lat, lon, weight]` for all open Reports, filtered by query params (issueType, severity, dateRange, department).
- [ ] 13.3 Create `IssueMap` component with Leaflet map, heatmap layer rendering data from `/api/heatmap/data`.
- [ ] 13.4 Add marker cluster layer showing individual Report pins; clicking a pin opens a popup with Report details (type, severity, summary, thumbnail, timestamp, status).
- [ ] 13.5 Auto-refresh heatmap data every 60 seconds using React Query `refetchInterval`.
- [ ] 13.6 Add filter panel (issueType checkboxes, severity dropdown, date range picker, department selector) that refetches heatmap data within 2s.

---

## Task 14: Predictive Issue Analysis

- [ ] 14.1 Create `services/predictionEngine.js` — query Reports from the past 90 days, group by issueType, cluster by geographic proximity (500m radius using `$geoNear` aggregation).
- [ ] 14.2 Clusters with ≥5 same-issueType Reports → medium risk; ≥10 → high risk.
- [ ] 14.3 Write Prediction documents (clearing previous run), storing centroid, dominantIssueType, recurrenceCount, riskRating.
- [ ] 14.4 Schedule with `node-cron` to run daily at 02:00.
- [ ] 14.5 Implement `GET /api/predictions` route — return all current Prediction records.
- [ ] 14.6 Frontend: render Predictions as a separate semi-transparent circle overlay on `IssueMap`, colour-coded by riskRating (orange = medium, red = high), toggled via map layer control.

---

## Task 15: Offline Report Creation and Sync

- [ ] 15.1 Set up a Service Worker in the client using Workbox.
- [ ] 15.2 Intercept `POST /api/reports` when offline — save report payload (photo blob, GPS, issueType) to IndexedDB.
- [ ] 15.3 Create `services/syncManager.js` on the frontend — listen for `navigator.onLine` change to `true`; iterate IndexedDB queue and POST each pending Report to the server.
- [ ] 15.4 On successful sync, remove record from IndexedDB and display assigned Report ID to citizen.
- [ ] 15.5 On 3 consecutive sync failures for a record, show error notification to citizen but keep record in IndexedDB.
- [ ] 15.6 Create `OfflineBanner` component — reads pending count from IndexedDB, displays "X reports pending sync" whenever count > 0.

---

## Task 16: Citizen Reputation Scoring

- [ ] 16.1 Create `services/reputationEngine.js` — exposes `increaseScore(userId, delta)` and `decreaseScore(userId, delta)` with clamp to [0, 100].
- [ ] 16.2 Hook into `updateReportStatus` controller: when status → 'resolved', call `increaseScore(report.submittedBy, 5)`.
- [ ] 16.3 Implement `PATCH /api/reports/:id/flag` (authority only) — mark Report as spam/invalid, call `decreaseScore(report.submittedBy, 10)`.
- [ ] 16.4 When Citizen's `reputationScore` < 10, set `report.lowPriority = true` on save; authority dashboard displays these reports last and with a review flag.
- [ ] 16.5 Display `reputationScore` badge next to citizen name on authority Report view.

---

## Task 17: Municipality Analytics Dashboard

- [ ] 17.1 Implement `GET /api/analytics/summary` (admin only) — return count of Reports grouped by `issueType` and `severityLevel` for a given date range.
- [ ] 17.2 Implement `GET /api/analytics/performance` — return average resolution time (submission → resolved) per department for a date range.
- [ ] 17.3 Implement `GET /api/analytics/trends` — return daily Report submission counts per issueType as time-series array.
- [ ] 17.4 Implement `GET /api/analytics/export` — generate and stream a CSV file of all Report fields matching filters; complete within 30 seconds.
- [ ] 17.5 Frontend: create `AdminAnalytics` page with Recharts bar chart (type/severity breakdown), line chart (trends), and performance metrics table.
- [ ] 17.6 Add date range picker and department filter to analytics page; update charts on filter change.
- [ ] 17.7 Add "Export CSV" button that triggers the download from `/api/analytics/export`.

---

## Task 18: Frontend Report Submission Flow

- [ ] 18.1 Create multi-step `ReportForm` component:
  - Step 1: Photo upload (drag-and-drop or camera capture), preview, size validation.
  - Step 2: GPS auto-capture via browser Geolocation API with map pin preview.
  - Step 3: Display AI-classified `issueType` and confidence; if confidence < 0.6, show dropdown for citizen to correct.
  - Step 4: Review summary and submit.
- [ ] 18.2 Show AI classification result and severity estimate on Step 3.
- [ ] 18.3 Display spinner during AI processing; show descriptive error toast on failure.
- [ ] 18.4 On successful submission, redirect to Report detail page showing the assigned Report ID.

---

## Task 19: Error Handling, Validation, and Security

- [ ] 19.1 Create `asyncHandler.js` utility that wraps async route handlers.
- [ ] 19.2 Create centralised Express error middleware returning `{ success: false, error: { code, message } }` JSON for all 4xx/5xx responses.
- [ ] 19.3 Add input validation with `express-validator` on all POST/PATCH routes.
- [ ] 19.4 Sanitise all user-supplied string inputs to prevent XSS.
- [ ] 19.5 Apply rate limiting (10 req/15 min) on `/api/auth/login` and `/api/auth/register`.
- [ ] 19.6 Configure CORS to allow only the frontend origin in production.
- [ ] 19.7 Frontend: wrap map and chart components in React Error Boundaries; display fallback UI on crash.

---

## Task 20: Final Integration and Deployment Preparation

- [ ] 20.1 Seed the database with default Departments and a test Admin, Authority, and Citizen user.
- [ ] 20.2 Write `README.md` at the repo root with setup instructions, env variable descriptions, and how to run locally.
- [ ] 20.3 Configure a `Procfile` or `docker-compose.yml` for running `server` and `client` together.
- [ ] 20.4 Verify all AI service calls (classifier, severity, embeddings, summariser) work end-to-end with a real image upload.
- [ ] 20.5 Verify the full offline → sync flow works: create report offline, reconnect, confirm sync.
- [ ] 20.6 Verify authority dashboard filters return results within 2 seconds with 1000+ seeded reports.
- [ ] 20.7 Verify prediction engine cron job writes correct Prediction documents.
