# The Plug — Trust & Security Baseline

**Status:** Security hardening in progress  
**Protected baseline:** Existing The Plug application on `main`  
**Scope:** Additive security controls only. Preserve existing customer journeys, storefront, account experience, operations workflows, visual design, PWA installation and offline behaviour.

## Administrator authentication

The Operations gate uses Google sign-in through Firebase Authentication. A successful Google login is not, by itself, administrator authorization.

The server verifies the Firebase ID token (including revocation), requires the Google sign-in provider and a verified email address, and checks the exact approved-email allowlist:

- frankchiwanga@yahoo.com
- gatshaayanda@gmail.com

Only after those checks does the trusted Firebase Admin SDK create or update the caller's `admins/{uid}` role record. Firestore and Storage administrator rules continue to require that trusted role record. The browser cannot create or edit administrator role records.

Successful administrator sign-ins are recorded in the server-only `adminSecurityEvents` collection. The collection is not exposed by client Firestore rules; unmatched access remains denied.

## Protocols and controls

| Area | Protocol / control | Implementation status |
|---|---|---|
| Admin identity | Google OAuth 2.0 via Firebase Authentication | Implemented in application code; Firebase Console provider/domain configuration must be verified |
| Token validation | Firebase Admin SDK ID-token verification with revocation check | Implemented |
| Admin authorization | Exact email allowlist + verified email + Google provider + trusted Firestore role record | Implemented |
| Data authorization | Firestore Security Rules; owner-scoped customer records; role-gated admin records | Existing baseline retained; full collection-by-collection audit pending |
| File authorization | Firebase Storage Security Rules with role and ownership checks, size/type limits | Existing baseline retained; full path audit pending |
| Transport security | HTTPS/TLS for production traffic and Firebase endpoints | Platform-managed; deployment configuration still requires verification |
| Encryption at rest | Firebase/GCP managed encryption at rest | Provider-managed; project/contract configuration and any additional encryption needs require assessment |
| Security audit trail | Server-written successful admin sign-in events | Implemented |
| Client-side secret handling | Admin service credentials remain server-side | Existing pattern retained; deployment secret access needs review |
| Default denial | Unmatched Firestore and Storage paths denied | Existing baseline retained |

## Not yet claimed as implemented

The following require separate design, implementation and verification before any compliance or security claim is made:

- Customer-facing access, correction, export and deletion request workflows.
- Data inventory, purpose/lawful-basis register and retention schedule.
- Consent and communication-preference review.
- Processor/subprocessor agreements and international-transfer assessment.
- Breach detection, response runbook and statutory notification workflow.
- Data protection impact assessments and DPO assessment where applicable.
- Automated abuse/rate-limit controls and suspicious-login alerting.
- Customer account recovery and optional additional-factor authentication.
- Independent penetration testing and rules test coverage.

## Operational configuration checklist

1. Enable **Google** under Firebase Authentication → Sign-in method.
2. Add the production and preview hostnames actually used by The Plug under Firebase Authentication → Settings → Authorized domains.
3. Confirm `FIREBASE_ADMIN_KEY` in the correct Vercel project/environment is a service account for the same Firebase project as the public web configuration.
4. Deploy the application and verify both approved accounts can enter Operations.
5. Verify an unapproved Google account is denied and signed out.
6. Verify customer sign-in/order/request flows, Firestore access and Storage uploads remain unchanged.
7. Verify sign-out closes the administrator session and the server audit event is written.

## Change-control rule

This is an additive security-hardening project. Do not redesign, refactor, remove, rename or reinterpret unrelated functionality. Any future security change must identify the exact control, affected paths, regression tests and rollback plan. The protected baseline is not a licence for broad cleanup.
