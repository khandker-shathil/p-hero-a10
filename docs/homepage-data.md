# Homepage data

The homepage reads `GET /api/home`. It uses `MONGODB_URI` and the existing
`digital-life-lesson` database (`MONGODB_DB_NAME` can override the homepage database).
Keep this database aligned with the database configured in `lib/auth.js`.

Future lesson creation and admin features should use this shape:

- Collection: `lessons`
- Fields: `title`, `description`, `category`, `emotionalTone`, `creatorId`,
  `visibility` (`public` or `private`), `accessLevel` (`free` or `premium`),
  `isFeatured` (boolean), and `createdAt` (MongoDB Date).
- `creatorId` references the Better Auth `user` collection's `_id`.
- Collection: `favorites`, with `lessonId` and `userId`. References can be MongoDB
  ObjectIds or their string forms. Each user's saves count once per lesson.

Featured: the newest three public lessons marked `isFeatured: true`.
Most saved: the top three public lessons with at least one favorite, calculated
from the favorites collection. Ties use newest creation date, then document ID.
Contributors: the top four authors by public lessons created in the last seven
rolling days. Private lesson activity is not exposed.

The public API returns only card metadata and short free-lesson previews. It
never returns private lessons, premium descriptions, user emails, or auth data.
Premium full-content access must be enforced independently by the future lesson
details API. A client-side lock is not an authorization boundary.

Empty collections show empty states. Connection/query errors show retry controls.
No example lessons or fabricated community statistics are inserted into MongoDB.
The hero reflection cards are editorial prompts, not database lessons.

Lesson details, public browsing, author profiles, admin controls, contact/terms
pages, and branded social account links belong to the remaining application work.
