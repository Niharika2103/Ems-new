import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import { LinkedIn, Twitter, Facebook, YouTube, WhatsApp } from "@mui/icons-material";

const LandingPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // 👉 Separate handlers
  const handleGetStarted = () => {
    navigate("/admin/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      title: "Finance",
      description:
        "Track budgets, manage expenses, and gain insights into your financial health.",
      icon: <AccountBalanceIcon sx={{ fontSize: 40, color: "#51b4f2" }} />,
    },
    {
      title: "Account",
      description:
        "Easily manage your account settings, preferences, and user information.",
      icon: <AccountCircleIcon sx={{ fontSize: 40, color: "#51b4f2" }} />,
    },
    {
      title: "HR & Email",
      description:
        "Streamline HR operations and communicate effectively through integrated email tools.",
      icon: <EmailIcon sx={{ fontSize: 40, color: "#51b4f2" }} />,
    },
  ];

  return (
    <>
      {/* Navbar */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "cursive" }}>
            Zentrix
          </Typography>

          {/* Desktop Menu */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Typography variant="body1" sx={{ cursor: "pointer" }}>
              Home
            </Typography>
            <Typography variant="body1" sx={{ cursor: "pointer" }}>
              Finance
            </Typography>
            <Typography variant="body1" sx={{ cursor: "pointer" }}>
              Accounts
            </Typography>
            <Typography variant="body1" sx={{ cursor: "pointer" }}>
              HR&Email
            </Typography>
          </Stack>

          {/* Mobile Menu Icon */}
          <IconButton
            edge="end"
            color="inherit"
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* 👉 Login button goes to /admin/login */}
          <Button
            variant="contained"
            sx={{ bgcolor: "#51b4f2", display: { xs: "none", md: "block" } }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {["Home", "Finance", "Accounts", "HR & Email"].map((text, idx) => (
              <ListItem button key={idx}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            sx={{ bgcolor: "#51b4f2", mt: 2, width: "100%" }}
            onClick={handleGetStarted} // 👉 Get Started → /admin/register
          >
            Get Started
          </Button>
        </Box>
      </Drawer>

      <Container>
        <Grid
          container
          sx={{ py: { xs: 6, md: 6 } }}
          alignItems="center"
          justifyContent="space-around"
        >
          {/* Left Side */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              textAlign: "left",
              px: { xs: 2, md: 4 },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
              Welcome to Your Business Hub
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: "text.secondary",
                maxWidth: "450px",
                lineHeight: 1.6,
              }}
            >
              Simplify your workflow with powerful tools for finance, account
              management, and HR operations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#51b4f2",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 25px rgba(10, 16, 126, 0.6)",
                },
              }}
              onClick={handleGetStarted} // 👉 Get Started → /admin/register
            >
              Get Started
            </Button>
          </Grid>

          {/* Right Side Image */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component={motion.img}
              src="../src/assets/langpic1.svg"
              alt="Business Hub"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              sx={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "12px",
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Section */}
      <Container sx={{ py: 4, curser: "pointer" }}>
        <Grid container spacing={3} wrap="nowrap">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  boxShadow: 3,
                  borderRadius: 3,
                  transition: "0.3s",
                  height: "100%",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 8px 25px rgba(10, 16, 126, 0.6)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ bgcolor: "grey.900", color: "grey.300", pt: 6, pb: 4 }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Company Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom color="white">
                Zentrix Workforce OS
              </Typography>
              <Typography variant="body2">
                A unified HR, Payroll & Freelancer platform designed for India-first
                compliance, payouts, and workforce management. Helping businesses manage
                employees, contractors, freelancers & vendors in one place.
              </Typography>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom color="white">
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Link href="" color="inherit" underline="hover">
                  Employees
                </Link>
                <Link href="" color="inherit" underline="hover">
                  Freelancers
                </Link>
                <Link href="" color="inherit" underline="hover">
                  Payroll & Compliance
                </Link>
                <Link href="" color="inherit" underline="hover">
                  Reports & Analytics
                </Link>
                <Link href="" color="inherit" underline="hover">
                  Job Publishing
                </Link>
              </Box>
            </Grid>

            {/* Vendors */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom color="white">
                Vendors & Partners
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2">Payroll Vendor</Typography>
                <Typography variant="body2">Razorpay / PayU</Typography>
                <Typography variant="body2">AWS SES & S3</Typography>
                <Typography variant="body2">WhatsApp Business API</Typography>
                <Typography variant="body2">Compliance Connectors</Typography>
              </Box>
            </Grid>

            {/* Contact & Social */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom color="white">
                Contact Us
              </Typography>
              <Typography variant="body2">📍 Chennai, India</Typography>
              <Typography variant="body2">📧 support@zentrixworkforce.com</Typography>
              <Typography variant="body2">📞 +91 98765 43210</Typography>

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <IconButton color="inherit" size="small">
                  <LinkedIn />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Twitter />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Facebook />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <YouTube />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <WhatsApp />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom bar */}
          <Divider sx={{ bgcolor: "grey.700", my: 4 }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography variant="body2">
              © 2025 Zentrix Workforce Pvt Ltd. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 3, mt: { xs: 2, md: 0 } }}>
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Terms & Conditions
              </Link>
              <Link href="/compliance" color="inherit" underline="hover">
                Compliance
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
