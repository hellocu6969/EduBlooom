<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3dc6ff3a-0f78-44e2-98c9-a3ab0629b1de

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
=======
# BLOOM TOGETHER – A11K65

Class activity and student point tracking application.

## Local development

Requirements: Node.js 22 or later.

```powershell
npm install
npm run dev
```

Development uses `data/database.json` as its only writable data source. Firestore is not written by the browser.

## Góc Tử Tế

The `/community` page includes class challenges based on approved positive points, class events, student goals, public thank-you messages, plant gifts, activity timelines, and consecutive-day streaks. Teachers can configure a shared initial student PIN; students can sign in with their student code, change to a private 4–6 digit PIN, and manage their own goal. Student PINs are stored only as bcrypt hashes.

Teachers can create student-specific activity reports for a selected date range and export them as Excel or print/save them as PDF. The report API is teacher-only. The feature data is stored in JSON during local development and in the `weeklyChallenges`, `classEvents`, `studentGoals`, `studentGratitude`, and `plantRewards` Firestore collections in production.

## Production data storage

Production uses Cloud Firestore through the Firebase Admin SDK. The browser only talks to this Express API; Firestore rules deny direct client access.

Configure the following in the deployment secret manager:

- `FIREBASE_PROJECT_ID`
- `FIRESTORE_DATABASE_ID` (optional; defaults to `(default)`)
- Either `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` using the deployment platform's supported credential setup.

Never commit service-account credentials. Do not configure production to fall back to `database.json`: the server fails closed if Firestore has not been initialized.

The in-process cache, write queue, and login sessions are intended for a **single Railway replica**. Do not scale horizontally without moving sessions and coordination to shared infrastructure.

Uploaded banner, logo, and teacher images are files under `data/uploads`; they are not stored in Firestore. Attach a persistent Railway volume at the app's `data` directory and include that directory in backups, or uploaded images may disappear after a redeploy. The JSON-to-Firestore migration does not copy image files.

## Import local JSON into Firestore

Stop application writes while preparing a migration. Confirm `data/database.json` is the authoritative, current export. Configure Firebase Admin credentials in the environment where the migration is run.

Review the source and current Firestore counts first:

```powershell
npm run migrate:firestore -- --dry-run
```

The migration validates document IDs, duplicate IDs and student codes, required collections, team/student references, and transaction records. It makes no writes during dry-run. A migration with overwrite confirmation first saves a timestamped Firestore backup under `data/backups/`, then replaces the application collections and metadata:

```powershell
npm run migrate:firestore -- --confirm-overwrite
```

Do not run the confirmed command until the dry-run output and source JSON have been reviewed. The JSON source is never deleted or modified by the migration script.

## Deploy to Railway

Use Node.js 22+, build with `npm run build`, and start with `npm start`. Add the Firestore secrets above and run one application replica. Deploy/restart the service only after the Firestore migration has completed and the health endpoint at `/api/health` reports the Firestore backend.
>>>>>>> 1a4b379 (3)
