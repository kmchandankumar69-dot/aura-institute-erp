Placement semester eligibility patch

This patch adds an Admin-controlled eligible semester criterion to Placement Cell opportunities.

Changes:
- Admin Placement Cell: new "Eligible semester(s)" field, e.g. 6, 7, 8.
- Placement records store eligibleSemesters.
- Student Placement Cell displays allowed semesters and the student's current semester.
- Student can apply only when both CGPA and semester criteria are satisfied.
- Server-side application endpoint enforces the semester rule; UI alone is not trusted.
- Existing placement records without eligibleSemesters remain available to all semesters for backward compatibility.

Apply this ZIP over the existing project, then run npm run typecheck and npm run build.
