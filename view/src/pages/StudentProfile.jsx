import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api/axios";

const DEGREE_LEVELS = ["Undergraduate", "Postgraduate", "Doctorate"];

const SUBJECT_CATEGORIES = {
  "Mathematics & Natural Sciences (MNS)": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Statistics",
    "Environmental Science",
    "Neuroscience",
  ],
  "Languages & Communication": [
    "Linguistics",
    "English & Literature",
    "Journalism",
    "Spanish",
    "French",
    "Public Relations",
  ],
  "Social & Behavioral Sciences": [
    "Psychology",
    "Sociology",
    "Political Science",
    "Economics",
    "Anthropology",
    "Criminal Justice",
  ],
  "Arts & Humanities": ["History", "Philosophy", "Fine Arts", "Graphic Design", "Music", "Film & Media"],
  "Computer Science & Technology": [
    "Computer Science",
    "Data Science",
    "Information Technology",
    "Cybersecurity",
    "Software Engineering",
  ],
  Business: ["Business Administration", "Finance", "Accounting", "Marketing", "Supply Chain Management"],
  Engineering: [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
  ],
  "Health Sciences": ["Nursing", "Public Health", "Kinesiology", "Health Administration"],
};

const MAX_SUBJECTS = 3;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const findCategoryFor = (subjects) =>
  Object.keys(SUBJECT_CATEGORIES).find((category) =>
    SUBJECT_CATEGORIES[category].some((s) => subjects.includes(s))
  ) || "";

export default function StudentProfile() {
  const [form, setForm] = useState({
    curriculumType: "",
    sscResult: "",
    hscResult: "",
    oLevelResult: "",
    aLevelResult: "",
    phone: "",
    address: "",
    degreeLevel: "",
    preferredLocation: "",
    profileImage: "",
  });
  const [subjectCategory, setSubjectCategory] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/student/profile");
        const profile = data.studentProfile || {};
        setForm((f) => ({ ...f, ...profile }));
        const savedSubjects = profile.subjectInterests || [];
        const category = findCategoryFor(savedSubjects);
        setSubjectCategory(category);
        setSelectedSubjects(
          category ? savedSubjects.filter((s) => SUBJECT_CATEGORIES[category].includes(s)) : []
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategoryChange = (e) => {
    setSubjectCategory(e.target.value);
    setSelectedSubjects([]);
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) return prev.filter((s) => s !== subject);
      if (prev.length >= MAX_SUBJECTS) return prev;
      return [...prev, subject];
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be smaller than 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      await api.patch("/student/profile", {
        ...form,
        subjectInterests: selectedSubjects,
      });
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 2 }}>
      <Button component={RouterLink} to="/dashboard" sx={{ mb: 2 }}>
        ← Back to dashboard
      </Button>

      <Typography variant="overline" display="block" gutterBottom>
        Student Records
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Profile
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar src={form.profileImage || undefined} sx={{ width: 72, height: 72 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Button variant="outlined" component="label" size="small">
                {form.profileImage ? "Change photo" : "Add picture"}
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Stack>

            <Typography variant="h6" gutterBottom>Academic background</Typography>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="curriculum-label">Curriculum</InputLabel>
                  <Select
                    labelId="curriculum-label"
                    name="curriculumType"
                    label="Curriculum"
                    value={form.curriculumType || ""}
                    onChange={handleChange}
                  >
                    <MenuItem value="NCTB">NCTB Curriculum</MenuItem>
                    <MenuItem value="British">British Curriculum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {form.curriculumType === "NCTB" && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="SSC result" name="sscResult" placeholder="e.g. GPA 5.00" value={form.sscResult || ""} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="HSC result" name="hscResult" placeholder="e.g. GPA 4.83" value={form.hscResult || ""} onChange={handleChange} fullWidth />
                  </Grid>
                </>
              )}

              {form.curriculumType === "British" && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="O Level result" name="oLevelResult" placeholder="e.g. 6A 2B" value={form.oLevelResult || ""} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="A Level result" name="aLevelResult" placeholder="e.g. 3A" value={form.aLevelResult || ""} onChange={handleChange} fullWidth />
                  </Grid>
                </>
              )}
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>Contact</Typography>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Address" name="address" value={form.address || ""} onChange={handleChange} fullWidth />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="degree-level-label">Preferred degree level</InputLabel>
                  <Select
                    labelId="degree-level-label"
                    name="degreeLevel"
                    label="Preferred degree level"
                    value={form.degreeLevel || ""}
                    onChange={handleChange}
                  >
                    {DEGREE_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Preferred location"
                  name="preferredLocation"
                  placeholder="e.g. Dhaka"
                  value={form.preferredLocation || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="subject-category-label">Category</InputLabel>
                  <Select
                    labelId="subject-category-label"
                    label="Category"
                    value={subjectCategory}
                    onChange={handleCategoryChange}
                  >
                    {Object.keys(SUBJECT_CATEGORIES).map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {subjectCategory && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl component="fieldset" variant="standard">
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Major / field of study ({selectedSubjects.length}/{MAX_SUBJECTS})
                    </Typography>
                    <FormGroup row>
                      {SUBJECT_CATEGORIES[subjectCategory].map((subject) => (
                        <FormControlLabel
                          key={subject}
                          sx={{ width: { xs: "100%", sm: "48%" } }}
                          control={
                            <Checkbox
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                              disabled={
                                !selectedSubjects.includes(subject) &&
                                selectedSubjects.length >= MAX_SUBJECTS
                              }
                            />
                          }
                          label={subject}
                        />
                      ))}
                    </FormGroup>
                    <FormHelperText>Select up to {MAX_SUBJECTS} in this category.</FormHelperText>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            <Button type="submit" variant="contained" sx={{ mt: 4 }} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Save profile"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
