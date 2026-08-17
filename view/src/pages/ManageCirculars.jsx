import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, TextField, CircularProgress, Alert, Stack, Card, CardContent, CardActions } from "@mui/material";
import api from "../api/axios";

const emptyForm = {
  programName: "",
  department: "",
  degreeLevel: "",
  seatsAvailable: "",
  minRequirements: "",
  applicationFee: "",
  deadline: "",
};

export default function ManageCirculars() {
  const [circulars, setCirculars] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  
  // New UX state variables
  const [isLoadingCirculars, setIsLoadingCirculars] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoadingCirculars(true);
    setError("");
    try {
      const { data } = await api.get("/circulars/mine");
      setCirculars(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load circulars");
    } finally {
      setIsLoadingCirculars(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");
    
    const payload = {
      ...form,
      seatsAvailable: Number(form.seatsAvailable),
      applicationFee: Number(form.applicationFee),
    };
    
    try {
      if (editingId) {
        await api.patch(`/circulars/${editingId}`, payload);
        setMessage("Circular updated successfully.");
      } else {
        await api.post("/circulars", payload);
        setMessage("Circular posted successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      load(); // Reload list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit circular.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (circular) => {
    setEditingId(circular._id);
    setForm({
      programName: circular.programName,
      department: circular.department,
      degreeLevel: circular.degreeLevel || "",
      seatsAvailable: circular.seatsAvailable,
      minRequirements: circular.minRequirements,
      applicationFee: circular.applicationFee,
      deadline: circular.deadline?.slice(0, 10) || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    setIsDeleting(true);
    setError("");
    try {
      await api.delete(`/circulars/${id}`);
      setMessage("Circular deleted successfully.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete circular.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box className="page" sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Button component={RouterLink} to="/dashboard" sx={{ mb: 2 }}>
        ← Back to dashboard
      </Button>
      
      <Typography variant="overline" display="block" gutterBottom>
        University Office
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Admission Circulars
      </Typography>
      
      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 6, p: 3, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? "Edit Circular" : "Post a New Circular"}
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField label="Program name" name="programName" value={form.programName} onChange={handleChange} required fullWidth />
          <TextField label="Department" name="department" value={form.department} onChange={handleChange} required fullWidth />
          <TextField label="Degree level" name="degreeLevel" value={form.degreeLevel} onChange={handleChange} fullWidth />
          <TextField label="Seats available" name="seatsAvailable" type="number" value={form.seatsAvailable} onChange={handleChange} required fullWidth />
          <TextField label="Minimum requirements" name="minRequirements" value={form.minRequirements} onChange={handleChange} required fullWidth multiline rows={2} />
          <TextField label="Application fee" name="applicationFee" type="number" value={form.applicationFee} onChange={handleChange} required fullWidth />
          <TextField label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />

          <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : (editingId ? "Save changes" : "Post circular")}
            </Button>
            {editingId && (
              <Button type="button" variant="outlined" onClick={() => { setEditingId(null); setForm(emptyForm); }} disabled={isSubmitting}>
                Cancel edit
              </Button>
            )}
          </Box>
        </Stack>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom>
        Your Circulars
      </Typography>
      
      {isLoadingCirculars ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {circulars.length === 0 ? (
            <Typography color="text.secondary">No circulars posted yet.</Typography>
          ) : (
            circulars.map((c) => (
              <Card key={c._id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{c.programName}</Typography>
                  <Typography color="text.secondary">
                    {c.department} — {c.seatsAvailable} seats
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Deadline: {new Date(c.deadline).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => startEdit(c)} disabled={isSubmitting || isDeleting}>Edit</Button>
                  <Button size="small" color="error" onClick={() => remove(c._id)} disabled={isSubmitting || isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Box>
  );
}
