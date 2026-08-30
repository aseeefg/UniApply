import { useEffect, useState } from "react";
import api from "../api/axios";

// Fetches just enough of the role's profile to show a photo and whether the
// profile looks filled in, so callers can offer "Complete" vs "Edit".
export function useProfileSummary(role) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (role === "student") {
        try {
          const { data } = await api.get("/student/profile");
          const p = data.studentProfile || {};
          if (isMounted) {
            setSummary({ image: p.profileImage || null, complete: Boolean(p.curriculumType && p.degreeLevel) });
          }
        } catch {
          if (isMounted) setSummary({ image: null, complete: false });
        }
      } else if (role === "university") {
        try {
          const { data } = await api.get("/university/profile");
          const p = data.universityProfile || {};
          if (isMounted) {
            setSummary({
              image: p.logo || null,
              complete: Boolean(p.location && p.website),
              verificationStatus: data.verificationStatus,
            });
          }
        } catch {
          if (isMounted) setSummary({ image: null, complete: false });
        }
      } else if (role) {
        if (isMounted) setSummary({ image: null, complete: true });
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [role]);

  return summary;
}
