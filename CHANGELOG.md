# 4.10.2

 - add `guided_import` and `recover_*` type to `create-course`

# 4.10.1

 - allow for decimal gpa overall credits (#257)

# 4.10.0

 - move node version to engines and upgrade to v20 LTS
 - chore: update frontend paths
 - add database support for decimal course credits (#253)
 - add backend support for global course unlock (#256)

# 4.9.2

 - global-store: rename knexInstance to _knexInstance
 - global-store: fix using wrong db on first getKnex() call
 - chore: simplify session store creation
 - add backend support for Kangaroo mode (#248)
 - remove usage of node-fetch

# 4.9.1

 - syllabus: tweak validation constraints

# 4.9.0

 - Add inline semester configuration
 - Switch to `@gradebook/trusted-request` for internal request "firewall"
 - Add syllabus uploading

# 4.8.11

 - fix lockfile issues

# 4.8.10

 - increase max length of debug data
 - increase create course rate limit

# 4.8.9

 - :bug: allow user issue reporting without debug data
 - widen content-type check
 - fix incorrect negation in enhanced fetch
 - include sid in html response header

# 4.8.8

 - fix(fetch): include response body on invalid content types
 - improve logging on failed cloudflare cache requests

# 4.8.7

 - Fix CI failures

# 4.8.6

 - allow `null` as a color in course settings
 - finalize UserIssueReporter API

# 4.8.5

 - audit security headers and apply on home page

# 4.8.4

 - :bug: serializer: disallow unintentionally sending an empty body

# 4.8.3

 - :bug: fix hanging transaction when trying to delete an empty semester
 - :bug: fix pipeline cancellation failure when using `response.end()`
 - add route to update GPA settings all at once

# 4.8.2

 - improve error handling when fetching server version revision fails

# 4.8.1

 - :sparkles: provide anonymous session number to client
 - :card_file_box: remove nullable constraint for course credit_hours
 - update copy for validation errors
 - [internal] add support for stopping, enabling, and disabling client-side live-reload

# 4.8.0

 - :sparkles: add user issue reporting route
 - :sparkles: add support for importing courses from shrink
 - :bug: fix passport auth clearing session data

# 4.7.1

 - :building_construction:️ use JSON redirect instead of HTTP redirect for `/me` API endpoint (#213)

# 4.7.0

:sparkles: provide active and primary semesters in core-data
:sparkles: allow editing courses in archived semesters
 - bump @gradebook/time
 - test: add warning when database is not migrated
 - remove response body for semester.delete controller
 - add NODE_ENV to contract test script

# 4.6.0

 - :sparkles: add emoji support for text fields
 - :recycle: drop mock-knex in favor of a local mocker
 - :wrench: switch to esm
 - :wrench: include controller name in pipeline errors
 - remove obselete apple meta tags
 - Improve core-developer-tools: local auth and secure protocol warnings

# 4.5.1

 - :bug: fix validation error when creating a course with more than 5 credit hours

# 4.5.0

 - :sparkles: add schema loader to allow dynamic limit configuration
 - :sparkles: increase max GPA credits to 9
 - :sparkles: add initial support for shrink (course-search) integration
 - :card_file_box: add missing foreign key to courses.user_id
 - include render timestamp in home page
 - double default rate limit for batch edit requests
 - Fix references to non-existant manifests in school config

# 4.4.10

 - :bug: fix user settings endpoint content-type

# 4.4.9

- Revert "bump course serializer"

# 4.4.8

- fix actions/setup-node cache workaround
- update course serializer
- update @gradebook/time

# 4.4.7

:wrench: update api method signatures to require database
:wrench: ci: use mysql for functional tests
 - add error handling for user logic
 - add @gradebook/core-developer-tools as a dependency
 - use node 16
 - add feedbackSemester to user settings

# 4.4.6

 - :bug: fix host matching error for courses.complete controller
 - centralize default setting value
 - add initial support for developer tools

# 4.4.5

 - :bug: fix oauth redirect not respecting configured subdirectory
 - :fire: remove legacy course create endpoints
 - Update rate limits
 - Add completeCourseCreate endpoint

# 4.4.4

 - :bug: fix account creation error while importing a course
 - :bug: fix api inconsistency between create course validator and user import
 - :art: respond with a generic error message when non-4xx error occurs

# 4.4.3

 - :bug: fix course settings not being saved with host matching

# 4.4.2

 - :sparkles: support escaped courses (#182)
 - :card_file_box: add migration to allow multi-step user tours
 - add support for editing bonus_points in settings
 - Update user settings validator to allow only numbers
 - remove demo course from new user
 - fix flag-based numeric issues
 - enable actions on renovate branches
 - switch from actions-hook to release-utils

# 4.4.1

 - :lock: :bug: fix permissions wrap allowing pipeline to continue (resource limit bypass)

# 4.4.0

 - :recycle: refactor course.create api to use category.create api
 - :sparkles: allow creating "real" courses via api.course.create
 - :sparkles: add support for importing a user via js-api
 - Improve types
 - Update create / import course routing config

# 4.3.2

 - :bug: fix unhandled error when deleting new user
 - :bug: fix frontend version not being detected
 - :bug: apple-meta: add handling when user agent doesn't exist
 - add `PUT /api/v0/courses/legacy` endpoint
 - update js API methods to accept transactions
 - export: perform all serialization in server

# 4.3.1

 - fix cutoffs inconsistency between create end edit course

# 4.3.0

 - :bug: fix schema not being typechecked
 - :bug: disallow creating a course in an inactive semester
 - :bug: fix non host-matching migrations failing w/ migration script
 - log error when template fails to load
 - [internal] improve global and local typings
 - [internal] enable repo-wide typechecking
 - add support for course settings
 - dev: fix root requests being handled by express static
 - update per-school injections to include web manifests, theme colors, and apple-specific tags on apple devices

# 4.2.0

 - :fire: remove statistics cron job
 - fix OutgoingMessage.prototype._headers is deprecated message (update Ghost Ignition)
 - Allow grade names to be up to 55 characters (bumped from 50)
 - Alter default ratelimiting config for batch edit category
 - Add some user migrations
 - Node 14.x LTS
 - Add feedback API endpoint

# 4.1.3

 - Fix previous broken build

# 4.1.2

 - :fire: remove uncaught exception handlers
 - :bug: ensure all user data is removed from session when logging out
   - destroy the entire session rather than just log the user out

# 4.1.1

 - :bug: set and return grade values as null in course.import
 - increase max API Payload size to 20k

# 4.1.0

This release contains some configuration updates:

 - There's now an explicit key for frontend caching (`cache frontend`) which defaults to `true`
 - Cookie Domain now defaults to `.gbdev.cf`
 - `default school configuration` allows choosing what configuration to use for school configuration by default.
 - Environment can be explicitly specified via the `environment` key. As part of this, more features are configured based on (not) being in production

Other changes

 - :sparkles: add support for using a custom course when creating an account
 - :bug: fix create account flow breaking when making `/me` API requests
 - Update marketing redirect to use config.domain
 - [internal] Allow customizing the default school config blob via config
 - [internal] Add configuration flag to cache frontend
 - [internal] Allow explicitly setting environment in config
 - [internal] Update incorrect host redirect to include request path

# 4.0.1

This release contains removes some deprecated markup, and fixes a cache bug in the school configuration service

 - :bug: clear school config cache after successfully reloading
 - :fire: remove theme configuration
 - remove `theme` property from `site-config`

# 4.0.0

We're excited to launch Gradebook Server 4.0. This release does not include many new features, but it includes security enhancements, bug fixes, removing deprecated code, and internal tooling updates that make development safer and easier. There are breaking API changes which require an updated client.

 - :sparkles: dramatically improved Types support using JSDoc
    - Lint also runs Type Checks now!
 - :sparkles: upgrade theme service to support [per-school configuration files](https://github.com/gradebook/school-configuration)
 - :sparkles: dynamically compute active semesters
 - :sparkles: add new `slim-data` endpoint which sends less data over the wire
   - This might replace `core-data` in the future!
 - :sparkles: PUT categories supports creating grades at the same time
 - :zap: improve performance of model layer by using POJOs instead of Maps
 - :lock: rework model validator to better prevent storing weird data
 - :lock: limit grades.browse response to those owned by the user
 - :lock: coerce config booleans to a string before comparing
 - :lock: require browse API calls to disallow unknown parameters and require at least 1 known parameter
 - :recycle: improve separation of concerns across all services
 - :recycle: update API functions to destructure a single parameter instead of having multiple parameters
 - :wrench: rename test files to end with `.spec.js`
 - :fire: remove cached data support
 - :fire: remove support for data events
 - :fire: remove sanitizers
 - :fire: remove additionalValidations from baseAPI.update
 - :fire: remove knex-migrator (#130)
 - :fire: remove contract category API
 - :fire: remove category expand API
 - :building_construction: limit _* fields to data access (knex, models) layer
   - This means API responses don't have _* fields as well
 - :building_construction: rework almost every single route to use Request Pipelining
   - Ensures every request goes through Rate Limiting (if needed), validation, permissions, execution, and response serialization
 - :building_construction: refactor Models to use Class Inheritance instead of Closures

# 3.11.1

 - :bug: fix validation error occuring when creating a new account

# 3.11.0
  - Disable SQL-based ratelimiting (#114)
  - Enforce read-only semesters (#125)
  - Merge course cutoffs into single column (#126)

# 3.10.4

 - :bug: fix statistics failing with no ignored users
 - update lots of dependencies

# 3.10.3

 - :bug: fix broken tests

# 3.10.2

 - :bug: fix account creation failing

# 3.10.1

 - :bug: fix home controller throwing errors

# 3.10.0

 - :lock: make semester a paramater in statistics
 - :lock: sanitize user data in home controller
 - :bug: fix category contraction in sqlite (#110)
 - :bug: fix sql join order to prevent stats failure (#120)
 - :recycle: Consolidate auth logic to package (#113)
 - :chart_with_upwards_trend: add support from blacklisting users from analytics
 - Rename user.{first,last}Name to user.{first,last}_name

# 3.9.0

 - :sparkles: add `gpaSemester` user setting (#107)
 - :sparkles: add server-side live reloading

# 3.8.0

 - :wrench: enable live-reloading with `yarn dev`
 - :lock: limit grade values to 999999
 - :bug: clean up inconsistincies between semester API and semester Controller
 - :wrench: update semester to 2020U

# 3.7.1

 - :lipstick: update theme colors
 - :bug: fix api.category.contract call not having db table

# 3.7.0

 - :sparkles: add import course endpoint
 - :recycle: use import course endpoint on user.approve
 - :bug: fix 401 errors when creating an account

# 3.6.2

 - :zap: move grade.edit null check to validation layer
 - :lock: disallow expansion of a category without a name or weight
 - :bug: disallow grades with no names in category.batch requests
 - :bug: disallow create a grade with no name
 - :bug: store `dropped` property when creating a category

# 3.6.1

 - :alien: update clear-cloudflare-cache to use host-matching when possible

# 3.6.0

 - :bug: allow prev gpa setting to be 5
 - :building_construction: expose category.dropped_grades (as dropped) CRUD
 - Require credit hours when creating a course (GPA is now fully released)

# 3.5.1

- Add support for `overallCredits` and `overallGpa` user setting
- Allow weight to be 0 for categories

# 3.5.0

- :sparkles: add category.contract endpoint
- :lock: Require semester when creating a course
- :bug: disallow loading local assets in prod
- :bug: disallow expanding already-expanded category
- Add `version` field to user export
- Add supports for `credits` property in a course
- Disallow `key` in POST user.settings body (3.4.2 deprecated this behavior)
- Reduce logging from stats
- Log request body when handling uncaught error

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
