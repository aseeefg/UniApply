import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

const items = [
  {
    icon: <SchoolRoundedIcon sx={{ color: "primary.main" }} />,
    title: "One portal, every university",
    description: "Search, compare, and apply to admission circulars from multiple institutions in one place.",
  },
  {
    icon: <VerifiedUserRoundedIcon sx={{ color: "primary.main" }} />,
    title: "Verified institutions only",
    description: "Every university account is manually approved by an admin before it can post a circular.",
  },
  {
    icon: <TimelineRoundedIcon sx={{ color: "primary.main" }} />,
    title: "Real-time status tracking",
    description: "Every application carries a full timestamped history, from submission to final decision.",
  },
  {
    icon: <NotificationsActiveRoundedIcon sx={{ color: "primary.main" }} />,
    title: "Deadline-aware",
    description: "Circulars close automatically once the deadline passes, so you never apply too late.",
  },
];

export default function AuthContent() {
  return (
    <Stack sx={{ flexDirection: "column", alignSelf: "center", gap: 4, maxWidth: 420 }}>
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: "text.primary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Fraunces", serif',
            fontWeight: 700,
          }}
        >
          UA
        </Box>
        <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif' }}>
          UniApply
        </Typography>
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
