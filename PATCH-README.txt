AURA NEXT ERP UPGRADE PATCH

Built against the uploaded aura-admin-cgpa-studentid-event-fix reference ZIP. This is intentionally a PATCH, not a replacement for the full aura-site project. Merge these files into the current master project.

Implemented in this patch:
1. Placement semester eligibility: admin can specify eligible semesters such as 6,7,8; server enforces both CGPA and semester. Blank means all semesters.
2. Student portal displays current semester and the placement eligibility reason.
3. Digital Student ID preview + aesthetically styled downloadable standalone HTML ID card. The HTML can be opened and printed/saved as PDF from the browser.
4. Admin dashboard with student/admission/company/event/placement counts and placement conversion metrics.
5. Admission progress tracker for students.
6. Cultural event registration CSV export.
7. Student notifications for admission and placement status changes, plus mark-all-read endpoint.
8. Admin audit log for CGPA changes, placement creation, admission status changes and placement application decisions.
9. Placement analytics/status counts in the admin overview.

Feature intentionally NOT added: admission document-management uploads.

Important integration note:
The uploaded ZIP does not contain the entire aura-site source or the existing Placement/User models. Therefore this patch does not overwrite those missing master files. Merge it into the full project that already contains them.

Validation after merge:
npm run typecheck
npm run build
npm run indexes
Then restart the production server using your existing deployment command.

Student ID note:
The Download ID card button creates a polished standalone HTML card. The browser can print that file to PDF. A binary PDF generator was deliberately not introduced because the uploaded reference ZIP does not include the project's dependency manifest.
