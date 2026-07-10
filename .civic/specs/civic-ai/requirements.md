# Requirements Document

## Introduction

CivicAI is an AI-powered public issue reporting platform that enables citizens to report infrastructure problems (potholes, broken streetlights, overflowing garbage, damaged roads, fallen trees, water leakage, etc.) via photo and location. The platform uses AI to classify issues, estimate severity, suggest responsible departments, and automatically merge duplicate reports. Municipal authorities receive a dashboard with heatmaps and prioritized issue queues. Citizens can track the status of their reports and receive progress updates. Advanced capabilities include predictive area analysis, offline report creation with sync, citizen reputation scoring to reduce spam, and a full analytics dashboard for municipalities.

---

## Glossary

- **System**: The CivicAI platform (backend services + frontend application) as a whole.
- **Report**: A citizen-submitted record of a public infrastructure issue, containing at minimum a photo, a geographic location, and a timestamp.
- **Classifier**: The AI/ML image classification component that identifies the type of issue from a submitted photo.
- **Severity_Estimator**: The AI component that estimates the urgency/severity of an issue based on image and contextual data.
- **Department_Router**: The component that maps a classified issue type and location to the responsible municipal department.
- **Duplicate_Detector**: The component that uses image embeddings and geographic proximity to identify and merge duplicate reports.
- **Report_Summarizer**: The LLM-based component that generates a human-readable summary of a report for authorities.
- **Heatmap_Engine**: The component that aggregates issue locations and renders geographic heatmaps for the authority dashboard.
- **Prediction_Engine**: The ML component that identifies geographic areas prone to recurring infrastructure issues.
- **Reputation_Engine**: The component that maintains and updates citizen reputation scores based on reporting behaviour.
- **Sync_Manager**: The component that queues reports created offline and submits them when network connectivity is restored.
- **Citizen**: An end-user of the platform who submits and tracks issue reports.
- **Authority**: A municipal employee or administrator who reviews, prioritizes, and resolves reports via the dashboard.
- **Issue_Type**: A classified category of infrastructure problem (e.g., pothole, broken streetlight, overflowing garbage, fallen tree, water leakage, damaged road).
- **Severity_Level**: An ordinal scale (Low, Medium, High, Critical) used to prioritize issues.
- **Embedding**: A high-dimensional vector representation of an image used for similarity comparison.
- **Duplicate_Threshold**: A configurable similarity score above which two reports are considered duplicates.
- **Reputation_Score**: A numerical value assigned to each Citizen representing their historical reporting accuracy and volume.

---

## Requirements

### Requirement 1: Issue Report Submission

**User Story:** As a Citizen, I want to submit a photo and my current location to report a public infrastructure issue, so that the relevant authorities are notified quickly and accurately.

#### Acceptance Criteria

1. THE System SHALL accept a Report submission containing at minimum one photo and a geographic coordinate pair (latitude, longitude).
2. WHEN a Citizen submits a Report, THE System SHALL store the photo in cloud image storage and record the Report in the database within 5 seconds under normal network conditions.
3. IF a submitted photo exceeds 20 MB, THEN THE System SHALL reject the submission and return a descriptive error message indicating the size limit.
4. IF a submitted Report is missing either a photo or a geographic location, THEN THE System SHALL reject the submission and return a descriptive error message identifying the missing field.
5. WHEN a Report is successfully stored, THE System SHALL return a unique Report identifier to the Citizen.

---

### Requirement 2: AI-Powered Issue Classification

**User Story:** As a Citizen, I want the platform to automatically identify the type of issue from my photo, so that I do not need to manually categorise the problem.

#### Acceptance Criteria

1. WHEN a photo is received, THE Classifier SHALL analyse the image and assign an Issue_Type from the supported taxonomy (pothole, broken streetlight, overflowing garbage, fallen tree, water leakage, damaged road, other).
2. WHEN the Classifier assigns an Issue_Type, THE Classifier SHALL also return a confidence score between 0.0 and 1.0.
3. IF the Classifier confidence score is below 0.6, THEN THE System SHALL prompt the Citizen to confirm or correct the suggested Issue_Type before finalising the Report.
4. WHEN classification is complete, THE System SHALL attach the Issue_Type and confidence score to the Report record.

---

### Requirement 3: Severity Estimation

**User Story:** As an Authority, I want each report to carry an estimated severity level, so that I can prioritise the most urgent issues first.

#### Acceptance Criteria

1. WHEN a Report is classified, THE Severity_Estimator SHALL assess the image and Issue_Type and assign a Severity_Level (Low, Medium, High, or Critical) to the Report.
2. WHEN a Severity_Level is assigned, THE System SHALL attach it to the Report record and make it visible on the authority dashboard.
3. THE Severity_Estimator SHALL produce a Severity_Level for every classified Report without requiring manual input from the Citizen.

---

### Requirement 4: Department Routing

**User Story:** As an Authority, I want reports to be automatically routed to the correct municipal department, so that no report is delayed by manual triage.

#### Acceptance Criteria

1. WHEN a Report has an assigned Issue_Type and a geographic location, THE Department_Router SHALL determine the responsible municipal department based on Issue_Type-to-department mapping rules and the Report's location jurisdiction.
2. WHEN a responsible department is determined, THE System SHALL attach the department identifier to the Report and make the Report visible in that department's queue on the authority dashboard.
3. IF no mapping rule matches the Issue_Type and location, THEN THE Department_Router SHALL assign the Report to a default "General" department and flag it for manual review.

---

### Requirement 5: Duplicate Detection and Merging

**User Story:** As an Authority, I want duplicate reports of the same issue to be automatically merged, so that my queue is not cluttered with redundant entries.

#### Acceptance Criteria

1. WHEN a new Report is stored, THE Duplicate_Detector SHALL compute an Embedding for the submitted photo and compare it against Embeddings of existing open Reports within a configurable geographic radius.
2. WHEN the similarity score between two Reports exceeds the Duplicate_Threshold AND the geographic distance between the two Reports is less than 100 metres, THE Duplicate_Detector SHALL mark the newer Report as a duplicate and link it to the original Report.
3. WHEN a Report is marked as a duplicate, THE System SHALL notify the submitting Citizen that their report has been linked to an existing open issue and provide the original Report's identifier.
4. WHEN a duplicate Report is merged, THE System SHALL increment the duplicate count on the original Report to reflect community corroboration.
5. THE Duplicate_Detector SHALL complete duplicate analysis within 10 seconds of Report storage under normal system load.

---

### Requirement 6: AI Report Summarisation

**User Story:** As an Authority, I want a concise AI-generated summary of each report, so that I can quickly understand the issue without viewing every photo individually.

#### Acceptance Criteria

1. WHEN a Report has an Issue_Type, Severity_Level, and location, THE Report_Summarizer SHALL generate a plain-language summary of no more than 100 words describing the issue, its severity, and its location.
2. WHEN a summary is generated, THE System SHALL attach it to the Report record and display it on the authority dashboard.
3. THE Report_Summarizer SHALL produce a summary for every qualifying Report without requiring input from the Citizen or Authority.

---

### Requirement 7: Map-Based Issue Visualisation and Heatmaps

**User Story:** As an Authority, I want to see all open issues plotted on a map with heatmap overlays, so that I can identify geographic concentrations of problems.

#### Acceptance Criteria

1. THE Heatmap_Engine SHALL aggregate the geographic coordinates of all open Reports and render a heatmap overlay on the authority dashboard map.
2. WHEN an Authority applies a filter (by Issue_Type, Severity_Level, date range, or department), THE Heatmap_Engine SHALL update the heatmap to reflect only the filtered Reports within 2 seconds.
3. WHEN an Authority clicks on a map marker, THE System SHALL display the Report's Issue_Type, Severity_Level, summary, photo thumbnail, submission timestamp, and current status.
4. THE System SHALL refresh the map and heatmap data at intervals of no more than 60 seconds without requiring a manual page reload.

---

### Requirement 8: Citizen Report Tracking and Status Updates

**User Story:** As a Citizen, I want to track the status of my submitted reports and receive updates when their status changes, so that I know my issue is being addressed.

#### Acceptance Criteria

1. WHEN a Citizen authenticates and navigates to their report history, THE System SHALL display all Reports submitted by that Citizen along with each Report's current status (Submitted, Under Review, In Progress, Resolved, Closed).
2. WHEN a Report's status changes, THE System SHALL send a notification to the submitting Citizen via their registered notification channel (in-app and/or email) within 60 seconds of the status change.
3. WHEN a Report is marked Resolved, THE System SHALL display the resolution notes and the date of resolution to the Citizen on the Report detail view.
4. WHEN a Citizen views a Report detail, THE System SHALL display the Report's Issue_Type, location, submission timestamp, photo, current status, and any status history entries.

---

### Requirement 9: Authority Dashboard and Issue Management

**User Story:** As an Authority, I want a centralised dashboard to view, prioritise, assign, and update the status of all reports in my department, so that I can manage fieldwork efficiently.

#### Acceptance Criteria

1. WHEN an Authority authenticates, THE System SHALL display only the Reports assigned to that Authority's department, sorted by Severity_Level (Critical first) by default.
2. WHEN an Authority updates a Report's status, THE System SHALL record the new status, the Authority's identifier, and the timestamp of the change.
3. WHEN an Authority adds resolution notes to a Report, THE System SHALL attach the notes to the Report and make them visible to the submitting Citizen.
4. THE System SHALL allow an Authority to reassign a Report to a different department, recording the reassignment reason and timestamp.
5. WHEN an Authority applies a filter or sort on the dashboard, THE System SHALL return the filtered and sorted results within 2 seconds.

---

### Requirement 10: Predictive Issue Area Analysis

**User Story:** As an Authority, I want the platform to identify geographic areas likely to develop recurring infrastructure issues, so that I can schedule preventive maintenance proactively.

#### Acceptance Criteria

1. THE Prediction_Engine SHALL analyse historical Report data and identify geographic clusters with a high recurrence rate of the same Issue_Type within a rolling 90-day window.
2. WHEN a high-recurrence cluster is identified, THE Prediction_Engine SHALL generate a prediction record containing the cluster's centroid coordinates, the dominant Issue_Type, the recurrence count, and a risk rating (Medium or High).
3. WHEN prediction records exist, THE System SHALL display them as a distinct overlay layer on the authority dashboard map, visually differentiated from active Reports.
4. THE Prediction_Engine SHALL recalculate predictions at least once every 24 hours.

---

### Requirement 11: Offline Report Creation with Sync

**User Story:** As a Citizen, I want to create a report when I have no internet connection and have it automatically submitted when connectivity is restored, so that I never lose a report due to poor network coverage.

#### Acceptance Criteria

1. WHILE a Citizen's device has no network connectivity, THE System SHALL allow the Citizen to create a Report (capture photo, record GPS coordinates, select Issue_Type) and store it locally on the device.
2. WHEN network connectivity is restored, THE Sync_Manager SHALL automatically upload all locally stored pending Reports to the server without requiring manual action from the Citizen.
3. WHEN a pending Report is successfully synced, THE Sync_Manager SHALL remove it from local storage and display the assigned Report identifier to the Citizen.
4. IF a locally stored Report fails to sync after 3 consecutive attempts, THEN THE Sync_Manager SHALL notify the Citizen of the failure and retain the Report in local storage for a subsequent manual or automatic retry.
5. THE System SHALL display the count of pending offline Reports to the Citizen at all times when at least one pending Report exists.

---

### Requirement 12: Citizen Reputation Scoring

**User Story:** As an Authority, I want a reputation score for each Citizen to help me identify reliable reporters and reduce spam, so that low-quality or malicious reports can be deprioritised automatically.

#### Acceptance Criteria

1. THE Reputation_Engine SHALL assign every Citizen a Reputation_Score initialised to 50 on account creation.
2. WHEN a Report submitted by a Citizen is marked Resolved by an Authority, THE Reputation_Engine SHALL increase that Citizen's Reputation_Score by a configurable increment (default: +5).
3. WHEN a Report submitted by a Citizen is marked as spam or invalid by an Authority, THE Reputation_Engine SHALL decrease that Citizen's Reputation_Score by a configurable decrement (default: -10).
4. WHEN a Citizen's Reputation_Score falls below 10, THE System SHALL automatically apply a lower display priority to new Reports from that Citizen on the authority dashboard and flag them for manual review.
5. THE Reputation_Score SHALL remain within the range of 0 to 100 at all times.
6. WHERE an Authority dashboard displays a Report, THE System SHALL display the submitting Citizen's current Reputation_Score alongside the Report.

---

### Requirement 13: Municipality Analytics Dashboard

**User Story:** As a municipal administrator, I want an analytics dashboard showing issue trends, resolution times, and departmental performance, so that I can make data-driven operational decisions.

#### Acceptance Criteria

1. THE System SHALL provide an analytics dashboard accessible only to users with the Administrator role.
2. WHEN an Administrator selects a date range, THE System SHALL display the total number of Reports submitted, grouped by Issue_Type and Severity_Level, within that range.
3. WHEN an Administrator views department performance metrics, THE System SHALL display the average time from Report submission to status change to "Resolved" per department for the selected period.
4. WHEN an Administrator views trend data, THE System SHALL display a time-series chart of Report submission volume per Issue_Type over the selected date range.
5. WHEN an Administrator exports report data, THE System SHALL generate a CSV file containing all Report fields for the selected filters and make it available for download within 30 seconds.

---

### Requirement 14: User Authentication and Authorisation

**User Story:** As a platform operator, I want secure authentication and role-based access control, so that Citizens, Authorities, and Administrators each access only the features appropriate to their role.

#### Acceptance Criteria

1. THE System SHALL support three roles: Citizen, Authority, and Administrator.
2. WHEN a user attempts to access a resource outside their role's permissions, THE System SHALL reject the request and return an HTTP 403 response.
3. WHEN a user authenticates successfully, THE System SHALL issue a signed JSON Web Token with an expiry of no more than 24 hours.
4. IF an authentication attempt is made with invalid credentials, THEN THE System SHALL return an HTTP 401 response and increment a failed-attempt counter for that account.
5. WHEN an account accumulates 5 consecutive failed authentication attempts, THE System SHALL lock the account and notify the account owner via their registered email address.

---

### Requirement 15: Image Storage and Retrieval

**User Story:** As a Citizen and Authority, I want submitted photos to be stored reliably and retrieved quickly, so that reports always include visual evidence of the issue.

#### Acceptance Criteria

1. WHEN a Report is submitted with a photo, THE System SHALL upload the photo to cloud image storage and record the resulting storage URL in the Report record.
2. WHEN a photo URL is requested, THE System SHALL serve the image via a CDN-backed URL to ensure retrieval within 3 seconds under normal conditions.
3. THE System SHALL store photos in a lossless or near-lossless format preserving sufficient detail for AI classification.
4. IF photo upload to cloud storage fails, THEN THE System SHALL retry the upload up to 3 times before returning an error to the Citizen and discarding the incomplete Report record.
