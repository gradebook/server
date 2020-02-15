# 3.4.2

- Fix root requests not having user in production
- Move user.settings.key from request body to request query

# 3.4.1

- Fix gbardr cookie handling
- Fix root requests in production

# 3.4.0

- Improvements to tests
  - Add more tests
  - Update CI configuration (dep updates, caching)
  - Make test harness work for us
  - Add routing tests
- Add credit_hours and dropped_grades to schema (they were missing)
- :sparkles: Add support for user notifications
- Bump node version to 12.15.x
- :bug: fix grade.read REST response
- :zap: improve course.read REST performance

# 3.3.1

- Fix singularization of words in categories
- Allow null weights in category (validation)
- Add Renovate

# 3.3.0

- Redirect users on incorrect hostname to correct hostname
- :sparkles: Add support for named course cutoffs
- Add multi-database migration helper scripts
- Remove usage of `user.isNew` data outside of session data
- Drop `courses.status` (it was phased out in 2.x)

# 3.2.3

- Singularize category names when expanding

# 3.2.2

- Add internal types
- Fix semester.delete analytics not being recorded
- Allow unauthenticated users to hit the health endpoint
- Add handling for unhandled promise rejections and uncaught errors

# 3.2.1

- Fix authentication failing for API routes

# 3.2.0

- Disable some routes in prod
- Minor security improvements
  - Disable x-powered-by header
  - Limit JSON Body size
- Add Matched Host to req (if applicable)
- Disable host-matching in some routes

# 3.1.0

- Fix analytics failing for API requests (did not prevent success of request)
- Update timezone-offset to always return a positive number
  - Now, a timezone is ahead if offset < 12
- Prevent users that quickly delete their accounts from counting in statistics

# 3.0.0

- ✨ Add support for using a sharding data based on hostname (uses different database)
  - Involves major refactor to database and API layer
- ✨ Add support for redis-based sessions, brute, and auth
  -  These services now have an SQL and Redis adapter
- ✨ Add support for theming, and inject theme into client
- 🔥  Remove v1 -> v2 migration scripts
- 🗃 Store unapproved users in sessions rather than in the database (involves large refactor to passport auth)
- 🔨 Update analytics service to support multiple databases
- ⚗ Die with context when encountering fatal errors
- ⬆ Bump node version
- ⚡️ Cancel fetching course grades when it has no categories
- 🚀 Add webhook support for user.created and user.deleted route actions

# 2.6.0

- Stop counting unapproved users in stats
- Add JSON-Schema based input validation
- Replace user.loggedIn analytics wih user.session
- 🔒 Sanitize user session before sending to express
- Add support for multiple semesters in category.browse API
- Add update-user-session middleware to track when user last logged used site
- Changed client mount from /app/ to /my/
- Refactor semester.delete API to permanently delete courses rather than marking them for deletion
- Update for Spring 2020

# 2.5.0

- Fix requireConsent middleware throwing 500 errors
- Fix database schema not reflecting what cron statistics expects
- Update category and grade limits

# 2.4.0

- Add core-data endpoint that returns all data needed by frontend at bootup

# 2.3.1

- Fix timezone offset not being computed

# 2.3.0

- Now uses node 12
- Update new user fixtures
- Add transactionless deadlock handling in database-response layer
- Fix grade.delete calls responding with 500 errors
- Add support for disabling saving analytics in the db
- Add user settings endpoint
- Ensure transactions are only committed by creator
- Add cache purging to version endpoint
- Add coverage to unit tests
- Add health check endpoint
- Bump node version
- Dynamically compute timezone offset
- Add constraints to course name and category weights

# 2.2.3

- Update authors list in package
- Fix incorrect statistics date being saved (off-by-one error)
- Update version endpoint to include client and server semver and git ref
- Update user.deleted analytics to only track active users

# 2.2.2

- Fix category.deleted analytics not being saved
- Fix error context not being provided when error is not Array-like
- Add fallback for frontend html template not existing

# 2.2.1

Fix actions timestamp not using 24-hour cycle

- Note: v2.2.0 commit got rebased after this!

# 2.2.0

First time using automated deployment infrastructure
