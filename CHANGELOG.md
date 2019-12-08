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
